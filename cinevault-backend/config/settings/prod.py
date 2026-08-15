import os

from .base import *  # noqa

DEBUG = False

# Railway / Render exposent leur domaine via une variable dédiée ; on l'ajoute
# automatiquement à ALLOWED_HOSTS en plus de ce qui est fourni dans .env.
_platform_host = os.environ.get("RAILWAY_PUBLIC_DOMAIN") or os.environ.get("RENDER_EXTERNAL_HOSTNAME")
ALLOWED_HOSTS = [h for h in os.environ.get("ALLOWED_HOSTS", "").split(",") if h]
if _platform_host:
    ALLOWED_HOSTS.append(_platform_host)
if not ALLOWED_HOSTS:
    ALLOWED_HOSTS = ["*"]  # à restreindre explicitement une fois le domaine connu

# Railway/Render terminent le TLS en amont : Django doit faire confiance au
# header transmis par leur proxy pour savoir que la requête est bien en HTTPS.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

CSRF_TRUSTED_ORIGINS = [
    o for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",") if o
]
