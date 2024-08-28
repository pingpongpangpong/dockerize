# myapp/backends.py

from social_core.backends.oauth import BaseOAuth2

class FortyTwoOAuth2(BaseOAuth2):
    name = '42'
    AUTHORIZATION_URL = 'https://api.intra.42.fr/oauth/authorize'
    ACCESS_TOKEN_URL = 'https://api.intra.42.fr/oauth/token'
    ACCESS_TOKEN_METHOD = 'POST'
    REFRESH_TOKEN_URL = ACCESS_TOKEN_URL
    DEFAULT_SCOPE = ['public']
    EXTRA_DATA = [
        ('access_token', 'access_token'),
        ('expires_in', 'expires'),
        ('refresh_token', 'refresh_token', True),
    ]

    def get_user_details(self, response):
        """Return user details from 42 account"""
        return {
            'username': response.get('login'),
            'email': response.get('email') or '',
            'first_name': response.get('first_name'),
            'last_name': response.get('last_name'),
        }

    def get_user_id(self, details, response):
        """Return a unique ID for the user"""
        return response['id']

    def user_data(self, access_token, *args, **kwargs):
        """Loads user data from service"""
        return self.get_json('https://api.intra.42.fr/v2/me', params={
            'access_token': access_token
        })
