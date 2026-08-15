from rest_framework.throttling import AnonRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """Throttle stricte pour les endpoints d'authentification (login/register),
    afin de limiter les attaques par force brute."""

    scope = "auth"
