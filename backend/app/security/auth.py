from typing import Optional, Dict, Any
from datetime import datetime, timedelta, timezone
from fastapi import Depends, Header
from backend.app.config import settings
from backend.app.utils.error_handlers import UnauthorizedException, ForbiddenException
from backend.app.schemas.auth import UserProfile
from backend.app.models.enums import UserRole


def create_access_token(user_data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a lightweight access token for local development/testing.
    Can be replaced with PyJWT when production crypto is attached.
    """
    import base64
    import json
    
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
    encoded = base64.urlsafe_b64encode(json.dumps(payload).encode("utf-8")).decode("utf-8")
    return f"cad_token_{encoded}"


def decode_token(token_str: str) -> Dict[str, Any]:
    """Decodes development token payload."""
    import base64
    import json

    if not token_str.startswith("cad_token_"):
        raise UnauthorizedException("Invalid token format")

    try:
        raw_b64 = token_str.replace("cad_token_", "")
        # Add padding if needed
        rem = len(raw_b64) % 4
        if rem > 0:
            raw_b64 += "=" * (4 - rem)
        decoded_bytes = base64.urlsafe_b64decode(raw_b64)
        payload = json.loads(decoded_bytes.decode("utf-8"))
        
        # Check expiry
        now_ts = int(datetime.now(timezone.utc).timestamp())
        if payload.get("exp", 0) < now_ts:
            raise UnauthorizedException("Token has expired. Please log in again.")
            
        return payload
    except Exception as e:
        if isinstance(e, UnauthorizedException):
            raise
        raise UnauthorizedException("Could not validate credentials")


async def get_current_user(authorization: Optional[str] = Header(None)) -> UserProfile:
    """Dependency for securing admin/dispatcher endpoints."""
    if not authorization:
        # In development mode, allow a fallback mock dispatcher if authorization header is omitted for ease of testing
        # but check format if provided
        return UserProfile(
            id="usr-402",
            username="dispatcher",
            full_name="Rajesh Sharma",
            badge_number="RAJ-CAD-402",
            role=UserRole.DISPATCHER,
            agency="Jaipur Police CAD Command",
        )

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
