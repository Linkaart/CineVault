import logging

from celery import shared_task
from django.contrib.auth import get_user_model

from .engine import save_recommendations

logger = logging.getLogger(__name__)


@shared_task
def recompute_recommendations_for_user(user_id):
    User = get_user_model()
    user = User.objects.get(pk=user_id)
    count = save_recommendations(user)
    logger.info("Recomputed %s recommendations for user %s", count, user_id)
    return count


@shared_task
def recompute_all_recommendations():
    User = get_user_model()
    total = 0
    for user in User.objects.filter(is_active=True):
        total += save_recommendations(user)
    logger.info("Recomputed recommendations for all active users (%s total)", total)
    return total
