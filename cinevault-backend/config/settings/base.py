import os
from datetime import timedelta
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY", "insecure-dev-key-change-me")
DEBUG = os.environ.get("DEBUG", "True") == "True"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "*").split(",")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party
    "rest_framework",
    "rest_framework_simplejwt",
    "django_filters",
    "corsheaders",
    # Local apps
    "apps.users",
    "apps.movies",
    "apps.reviews",
    "apps.watchlists",
    "apps.recommendations",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

AUTH_USER_MODEL = "users.User"

if os.environ.get("DATABASE_URL"):
    # Railway / Render exposent une URL de connexion unique
    DATABASES = {
        "default": dj_database_url.parse(
            os.environ["DATABASE_URL"], conn_max_age=600, ssl_require=True
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("POSTGRES_DB", "cinevault"),
            "USER": os.environ.get("POSTGRES_USER", "cinevault"),
            "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "cinevault"),
            "HOST": os.environ.get("POSTGRES_HOST", "db"),
            "PORT": os.environ.get("POSTGRES_PORT", "5432"),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Europe/Paris"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
}

# --- Celery ---
CELERY_BROKER_URL = os.environ.get("REDIS_URL", "redis://redis:6379/0")
CELERY_RESULT_BACKEND = os.environ.get("REDIS_URL", "redis://redis:6379/0")
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE

CELERY_BEAT_SCHEDULE = {
    "sync-movies-nightly": {
        "task": "apps.movies.tasks.sync_popular_movies",
        "schedule": 60 * 60 * 24,
    },
    "sync-genres-nightly": {
        "task": "apps.movies.tasks.sync_genres",
        "schedule": 60 * 60 * 24,
    },
    "recompute-recommendations-nightly": {
        "task": "apps.recommendations.tasks.recompute_all_recommendations",
        "schedule": 60 * 60 * 24,
    },
}

# --- TMDB ---
TMDB_API_KEY = os.environ.get("TMDB_API_KEY", "")

# --- CORS ---
CORS_ALLOWED_ORIGINS = os.environ.get(
    "CORS_ORIGINS", "http://localhost:3000"
).split(",")

# --- MinIO / S3 storage (optionnel, activé en prod pour les médias uploadés) ---
USE_S3 = os.environ.get("USE_S3", "False") == "True"
if USE_S3:
    INSTALLED_APPS += ["storages"]
    AWS_ACCESS_KEY_ID = os.environ.get("MINIO_ROOT_USER", "minioadmin")
    AWS_SECRET_ACCESS_KEY = os.environ.get("MINIO_ROOT_PASSWORD", "minioadmin")
    AWS_STORAGE_BUCKET_NAME = os.environ.get("MINIO_BUCKET", "cinevault")
    AWS_S3_ENDPOINT_URL = os.environ.get("MINIO_ENDPOINT", "http://minio:9000")
    AWS_S3_FILE_OVERWRITE = False
    AWS_DEFAULT_ACL = None
    STORAGES["default"] = {"BACKEND": "storages.backends.s3boto3.S3Boto3Storage"}
