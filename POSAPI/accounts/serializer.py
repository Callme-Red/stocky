
from rest_framework import serializers
from .models import CustomUser  # Asegúrate de que este sea el modelo correcto

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True)

    class Meta:
        model = CustomUser
        fields = ('email', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        # Verifica si el email ya está registrado
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value
    

    def create(self, validated_data):
        user = CustomUser(
            email=validated_data['email'],
            username=validated_data['username'],
        )
        user.set_password(validated_data['password'])  # Hashear la contraseña
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        # Busca al usuario usando el email
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Credenciales incorrectas")

        # Verifica si el usuario está activo
        if not user.is_active:
            raise serializers.ValidationError("Usuario inactivo. No puede iniciar sesión.")

        # Verifica la contraseña
        if user.check_password(password):
            return user
        
        raise serializers.ValidationError("Credenciales incorrectas")
    
class ChangePasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, required=True)

    def validate_new_password(self, value):
        # Aquí puedes agregar validaciones personalizadas para la nueva contraseña
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        return value

class ChangeEmailSerializer(serializers.Serializer):
    new_email = serializers.EmailField(required=True)

    def validate_new_email(self, value):
        # Verificar si el nuevo email ya está en uso por otro usuario
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este correo electrónico ya está en uso.")
        return value

class ChangeUsernameSerializer(serializers.Serializer):
    new_username = serializers.CharField(required=True)
    
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email','is_active']

class ChangeUserActiveStatusSerializer(serializers.Serializer):
    is_active = serializers.BooleanField(required=True)

    def validate_is_active(self, value):
        # Asegúrate de que el valor proporcionado sea un booleano
        if not isinstance(value, bool):
            raise serializers.ValidationError("El estado debe ser un valor booleano (True o False).")
        return value

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email','is_active']


