from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializer import RegisterSerializer, LoginSerializer,ChangeEmailSerializer,ChangeUsernameSerializer,UserListSerializer,ChangeUserActiveStatusSerializer
from .models import CustomUser  # Importa tu modelo personalizado
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from .models import CustomUser  

from rest_framework_api_key.permissions import HasAPIKey


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            # Valida los datos usando el serializador
            serializer.is_valid(raise_exception=True)
        except ValidationError as e:
            # Captura los errores de validación y extrae solo los mensajes de error
            error_messages = []
            for field_errors in e.detail.values():
                # Cada campo puede tener múltiples errores, se agregan todos a la lista
                error_messages.extend([str(error) for error in field_errors])

            # Retorna solo los mensajes de error en el formato requerido
            return Response({
                "message": " ".join(error_messages)
            }, status=status.HTTP_400_BAD_REQUEST)

        # Si los datos son válidos, guarda el usuario
        user = serializer.save()

        return Response({
            "message": "Usuario registrado exitosamente.",
            "user_id": str(user.id),
            "email": user.email,
            "username": user.username
        }, status=status.HTTP_201_CREATED)
    permission_classes = [HasAPIKey]

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            # Valida los datos usando el serializador
            serializer.is_valid(raise_exception=True)
        except ValidationError as e:
            # Captura los errores de validación y extrae solo los mensajes de error
            error_messages = []
            for field_errors in e.detail.values():
                error_messages.extend([str(error) for error in field_errors])

            # Retorna solo los mensajes de error en el formato requerido
            return Response({
                "message": " ".join(error_messages)
            }, status=status.HTTP_400_BAD_REQUEST)

        # Si la validación es exitosa, autenticamos al usuario
        user = serializer.validated_data
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            "token": token.key,
            "user_id": str(user.id),  # UUID como string
            "email": user.email,
            "username": user.username  # Incluir el username
        }, status=status.HTTP_200_OK)
    
    permission_classes = [HasAPIKey]

class ChangePasswordView(APIView):
    def post(self, request, user_id):
        # Obtiene el token desde el cuerpo de la solicitud
        token_key = request.data.get('token')
        new_password = request.data.get('new_password')
        
        # Verifica que se haya proporcionado el token y la nueva contraseña
        if not token_key:
            return Response({"message": "Accion denegada."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        if not new_password:
            return Response({"message": "Nueva contraseña es requerida."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verifica que el token sea válido, sin importar a qué usuario pertenece
            token = Token.objects.get(key=token_key)
            
            # Valida la nueva contraseña
            if len(new_password) < 8:
                return Response({"message": "La contraseña debe tener al menos 8 caracteres."}, 
                                status=status.HTTP_400_BAD_REQUEST)
            
            # Cambia la contraseña del usuario cuyo ID fue proporcionado
            user = CustomUser.objects.get(id=user_id)
            user.set_password(new_password)
            user.save()

            return Response({"message": "Contraseña cambiada exitosamente."}, 
                            status=status.HTTP_200_OK)

        except Token.DoesNotExist:
            return Response({"message": "Accion degenada."}, status=status.HTTP_403_FORBIDDEN)

        except CustomUser.DoesNotExist:
            return Response({"message": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    permission_classes = [HasAPIKey]
        
class ChangeEmailView(APIView):
    def post(self, request, user_id):
        token_key = request.data.get('token')
        new_email = request.data.get('new_email')

        # Verifica si el token fue proporcionado
        if not token_key:
            return Response({"message": "Acción denegada."}, status=status.HTTP_400_BAD_REQUEST)

        # Verifica si el nuevo correo electrónico fue proporcionado
        if not new_email:
            return Response({"message": "Nuevo correo electrónico es requerido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verifica que el token sea válido
            token = Token.objects.get(key=token_key)
            user = CustomUser.objects.get(id=user_id)

            # Valida el nuevo correo electrónico con el serializer
            serializer = ChangeEmailSerializer(data=request.data)
            if serializer.is_valid():
                # Si es válido, actualiza el correo del usuario
                user.email = serializer.validated_data['new_email']
                user.save()
                return Response({"message": "Correo electrónico actualizado correctamente."}, status=status.HTTP_200_OK)
            else:
                # Captura los errores del serializador y devuelve los mensajes
                error_messages = []
                for field, field_errors in serializer.errors.items():
                    error_messages.extend([str(error) for error in field_errors])
                
                return Response({"message": " ".join(error_messages)}, status=status.HTTP_400_BAD_REQUEST)

        # Manejo de excepciones para token inválido
        except Token.DoesNotExist:
            return Response({"message": "Acción denegada."}, status=status.HTTP_403_FORBIDDEN)

        # Manejo de excepciones si el usuario no es encontrado
        except CustomUser.DoesNotExist:
            return Response({"message": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    permission_classes = [HasAPIKey]

class ChangeUsernameView(APIView):
    def post(self, request, user_id):
        token_key = request.data.get('token')
        new_username = request.data.get('new_username')

        if not token_key:
            return Response({"message": "Accion denegada."}, status=status.HTTP_400_BAD_REQUEST)

        if not new_username:
            return Response({"message": "Nuevo nombre de usuario es requerido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = Token.objects.get(key=token_key)
            user = CustomUser.objects.get(id=user_id)

            # Valida y actualiza el nuevo nombre de usuario
            serializer = ChangeUsernameSerializer(data=request.data)
            if serializer.is_valid():
                user.username = serializer.validated_data['new_username']
                user.save()
                return Response({"message": "Nombre de usuario actualizado correctamente."}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Token.DoesNotExist:
            return Response({"message": "Accion denegada."}, status=status.HTTP_403_FORBIDDEN)

        except CustomUser.DoesNotExist:
            return Response({"message": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    permission_classes = [HasAPIKey]
        
class UserListView(APIView):
    def get(self, request):
        # Filtrar solo usuarios que no sean superusuarios ni staff
        users = CustomUser.objects.filter(is_superuser=False, is_staff=False, is_active = True)
        
        # Serializar los usuarios
        serializer = UserListSerializer(users, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    permission_classes = [HasAPIKey]


class ChangeUserActiveStatusView(APIView):
    def post(self, request, user_id):
        # Obtiene el token desde el cuerpo de la solicitud
        token_key = request.data.get('token')
        is_active = request.data.get('is_active')
        
        # Verifica que se haya proporcionado el token y el estado
        if not token_key:
            return Response({"message": "Accion denegada."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        if is_active is None:
            return Response({"message": "El estado 'is_active' es requerido."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verifica que el token sea válido, sin importar a qué usuario pertenece
            token = Token.objects.get(key=token_key)
            
            # Valida el campo 'is_active' utilizando el serializer
            serializer = ChangeUserActiveStatusSerializer(data=request.data)
            if serializer.is_valid():
                # Cambia el estado 'is_active' del usuario cuyo ID fue proporcionado
                user = CustomUser.objects.get(id=user_id)
                user.is_active = serializer.validated_data['is_active']
                user.save()

                return Response({"message": "Estado de usuario cambiado exitosamente."}, 
                                status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Token.DoesNotExist:
            return Response({"message": "Accion denegada."}, status=status.HTTP_403_FORBIDDEN)

        except CustomUser.DoesNotExist:
            return Response({"message": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    permission_classes = [HasAPIKey]

