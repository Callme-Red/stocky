from django.urls import path
from .views import RegisterView, LoginView,ChangePasswordView,ChangeEmailView,ChangeUsernameView,UserListView,ChangeUserActiveStatusView

urlpatterns = [
    path('api/v1/register/', RegisterView.as_view(), name='register'),
    path('api/v1/login/', LoginView.as_view(), name='login'),
    path('api/v1/change-password/<uuid:user_id>/', ChangePasswordView.as_view(), name='change_password'),
    path('api/v1/change-email/<uuid:user_id>/', ChangeEmailView.as_view(), name='change_email'),
    path('api/v1/change-username/<uuid:user_id>/', ChangeUsernameView.as_view(), name='change_username'),
    path('api/v1/users/', UserListView.as_view(), name='user_list'),
    path('api/v1/change-activate/<uuid:user_id>/', ChangeUserActiveStatusView.as_view(), name='change_activate'),
]