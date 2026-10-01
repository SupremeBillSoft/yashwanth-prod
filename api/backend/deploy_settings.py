import os
from pathlib import Path
from .settings import *

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = False
SECRET_KEY = os.environ.get('SECRET_KEY')

#ALLOWED_HOSTS = [os.environ.get('RENDER_EXTERNAL_HOSTNAME', 'ssoft-yaswanth-frontend.vercel.app')]
ALLOWED_HOSTS = ["yashwanthpaints-api.onrender.com", "yashwanthpaints-react.vercel.app", 
                 "www.yashwanthpaints.com",    "yashwanthpaints.com" ]

CSRF_TRUSTED_ORIGINS = ['https://'+os.environ.get('RENDER_EXTERNAL_HOSTNAME', 'yashwanthpaints-react.vercel.app'),
                           'https://www.yashwanthpaints.com',
                            'https://yashwanthpaints.com'
                           
                        ]

# REQUIRED FOR collectstatic
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
##STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# For whitenoise to manage staticfiles properly
STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
    },
}

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    # Add your deployed frontend URL here
    # "https://your-frontend.vercel.app"
    "https://www.yashwanthpaints.com",
    "https://yashwanthpaints.com",
    "https://yashwanthpaints-react.vercel.app"
    #"https://ssoft-yaswanth-frontend.vercel.app"
]
CORS_ALLOW_CREDENTIALS = True



DATABASES = {
    'default': {
        'ENGINE': 'mssql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '1433'),
        'OPTIONS': {
            'driver': 'ODBC Driver 17 for SQL Server',
        },
    }
}
