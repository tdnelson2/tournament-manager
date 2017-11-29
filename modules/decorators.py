from flask import flash, redirect
from flask import session as login_session, url_for
from functools import wraps




def login_required(func):
    """
    A decorator to confirm login or redirect as needed.
    """
    @wraps(func)
    def wrap(*args, **kwargs):
        print args

        if 'logged_in' in login_session:
            return func(*args, **kwargs)
        else:
            flash("[warning]You need to login first")
            return redirect(url_for('login.showLogin'))
    return wrap


def logout_required(func):
    """
    A decorator redirect to index if user is logged in.
    """
    @wraps(func)
    def wrap(*args, **kwargs):
        print args

        if 'logged_in' in login_session:
            flash("[warning]Guest version is for logged out users only. Log out if you wish to use it.")
            return redirect(url_for('index'))
        else:
            return func(*args, **kwargs)
    return wrap