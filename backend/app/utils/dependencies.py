"""
DEPRECATED: This module has been moved to app.core.dependencies.
This file re-exports for backward compatibility.
"""
from app.core.dependencies import get_current_user, get_current_teacher, get_current_parent

__all__ = ["get_current_user", "get_current_teacher", "get_current_parent"]
