from flask import flash, redirect
from flask import session as login_session
from functools import wraps




def login_required(func):
    """
    A decorator to confirm login or redirect as needed
    """
    @wraps(func)
    def wrap(*args, **kwargs):
        print args

        if 'logged_in' in login_session:
            return func(*args, **kwargs)
        else:
            flash("[warning]You need to login first")
            return redirect('/login/')
    return wrap