import { formatDistanceToNow } from 'date-fns';

const createActivity = (user, action, target) => {
    return {
        id: Date.now(),
        user: user.name,
        action,
        target,
        time: formatDistanceToNow(new Date(), { addSuffix: true })
    };
};

export const activityHelper = {
    createActivity
}