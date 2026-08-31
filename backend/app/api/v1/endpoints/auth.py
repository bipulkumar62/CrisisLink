from fastapi import APIRouter, Depends, status
from backend.app.schemas.auth import LoginRequest, TokenResponse
from backend.app.schemas.common import APIResponse
from backend.app.services.auth_service import AuthService
from backend.app.api.deps import get_auth_service

router = APIRouter()


@router.post(
    "/login",
    response_model=APIResponse[TokenResponse],
    status_code=status.HTTP_200_OK,
    summary="Authenticate dispatcher / admin operator",
    description="Validates operator credentials and returns an access token with agency profile information.",
)
async def login(
    login_in: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
) -> APIResponse[TokenResponse]:
    token_resp = await auth_service.authenticate_user(login_in)
    return APIResponse(
        success=True,
        message="Dispatcher credentials authenticated successfully.",
        data=token_resp,
    )
