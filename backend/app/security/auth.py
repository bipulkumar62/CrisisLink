import hmac
import hashlib
import json
import base64
import os
from typing import Optional, Dict, Any
from datetime import datetime, timedelta, timezone
from fastapi import Depends, Header
from backend.app.config import settings
from backend.app.utils.error_handlers import UnauthorizedException, ForbiddenException
from backend.app.schemas.auth import UserProfile
from backend.app.models.enums import UserRole


def _sign(data: str) -> str:
    """Create HMAC-SHA256 signature for the given data string."""
    return hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        data.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def create_access_token(user_data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a cryptographically signed access token.
    Format: cad_token_<base64_payload>.<hmac_signature>
    """
    expires = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {
        "sub": user_data["id"],
        "username": user_data["username"],
        "role": user_data["role"].value if hasattr(user_data["role"], "value") else str(user_data["role"]),
        "agency": user_data["agency"],
        "badge_number": user_data["badge_number"],
        "full_name": user_data["full_name"],
        "exp": int(expires.timestamp()),
    }
    payload_json = json.dumps(payload, separators=(",", ":"))
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode("utf-8")).decode("utf-8")
    signature = _sign(payload_b64)
    return f"cad_token_{payload_b64}.{signature}"


def decode_token(token_str: str) -> Dict[str, Any]:
    """Decodes and verifies a signed access token."""
    if not token_str.startswith("cad_token_"):
        raise UnauthorizedException("Invalid token format")

    try:
        token_body = token_str[len("cad_token_"):]
        parts = token_body.split(".", 1)
        if len(parts) != 2:
            raise UnauthorizedException("Invalid token structure")

        payload_b64, signature = parts

        # Verify HMAC signature
        expected_sig = _sign(payload_b64)
        if not hmac.compare_digest(signature, expected_sig):
            raise UnauthorizedException("Token signature verification failed")

        # Decode payload
        rem = len(payload_b64) % 4
        if rem > 0:
            payload_b64 += "=" * (4 - rem)
        decoded_bytes = base64.urlsafe_b64decode(payload_b64)
        payload = json.loads(decoded_bytes.decode("utf-8"))

        # Check expiry
        now_ts = int(datetime.now(timezone.utc).timestamp())
        if payload.get("exp", 0) < now_ts:
            raise UnauthorizedException("Token has expired. Please log in again.")

        return payload
    except UnauthorizedException:
        raise
    except Exception:
        raise UnauthorizedException("Could not validate credentials")


def hash_password(password: str) -> str:
    """Hash a password with PBKDF2-HMAC-SHA256 and a random salt."""
    salt = os.urandom(16).hex()
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}${dk.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against a PBKDF2-HMAC-SHA256 hash."""
    try:
        salt, expected_hex = stored_hash.split("$", 1)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
        return hmac.compare_digest(dk.hex(), expected_hex)
    except (ValueError, AttributeError):
        return False


async def get_current_user(authorization: Optional[str] = Header(None)) -> UserProfile:
    """Dependency for securing admin/dispatcher endpoints. Requires valid Bearer token."""
    if not authorization:
        raise UnauthorizedException("Missing authorization header. Please log in.")

    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise UnauthorizedException("Invalid authorization header format. Expected 'Bearer <token>'.")

    token = parts[1]
    payload = decode_token(token)
    return UserProfile(
        id=payload["sub"],
        username=payload["username"],
        full_name=payload["full_name"],
        badge_number=payload["badge_number"],
        role=UserRole(payload["role"]),
        agency=payload["agency"],
    )
