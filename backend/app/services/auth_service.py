from backend.app.db.base_repository import IUserRepository
from backend.app.schemas.auth import LoginRequest, TokenResponse, UserProfile
from backend.app.security.auth import create_access_token
from backend.app.utils.error_handlers import UnauthorizedException
from backend.app.utils.logger import logger


class AuthService:
    def __init__(self, user_repo: IUserRepository):
        self.user_repo = user_repo

    async def authenticate_user(self, login_in: LoginRequest) -> TokenResponse:
        user_record = await self.user_repo.get_by_username(login_in.username)
        if not user_record or user_record["password"] != login_in.password:
            logger.warning(f"Failed login attempt for username '{login_in.username}'")
            raise UnauthorizedException("Invalid username or password credentials.")

        profile = UserProfile(
            id=user_record["id"],
            username=user_record["username"],
            full_name=user_record["full_name"],
            badge_number=user_record["badge_number"],
            role=user_record["role"],
            agency=user_record["agency"],
        )

        token = create_access_token(user_record)
        logger.info(f"User {profile.username} ({profile.badge_number}) authenticated successfully")

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in_seconds=24 * 3600,
            user=profile,
        )
