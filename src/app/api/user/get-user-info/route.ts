import { PERMISSIONS } from '@/core/rbac';
import { respData, respErr } from '@/shared/lib/resp';
import { getRemainingCredits } from '@/shared/models/credit';
import { getOrders, OrderStatus } from '@/shared/models/order';
import { getCurrentSubscription } from '@/shared/models/subscription';
import { getUserInfo } from '@/shared/models/user';
import { hasPermission } from '@/shared/services/rbac';

export async function POST(req: Request) {
  try {
    // get sign user info
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in');
    }

    // check if user is admin
    const isAdmin = await hasPermission(user.id, PERMISSIONS.ADMIN_ACCESS);

    // get remaining credits
    const remainingCredits = await getRemainingCredits(user.id);

    // check if user has Pro entitlement (admin, active subscription, or paid one-time Pro order)
    let isPro = isAdmin;
    if (!isPro) {
      try {
        const [paidOrders, activeSub] = await Promise.all([
          getOrders({ userId: user.id, status: OrderStatus.PAID, limit: 10 }),
          getCurrentSubscription(user.id),
        ]);
        const hasProOrder = paidOrders.some(
          (o) => o.productId === 'pro_lifetime' || (o.amount && o.amount > 0)
        );
        isPro = hasProOrder || Boolean(activeSub);
      } catch (proErr) {
        console.log('check pro entitlement failed:', proErr);
      }
    }

    return respData({ ...user, isAdmin, isPro, credits: { remainingCredits } });
  } catch (e) {
    console.log('get user info failed:', e);
    return respErr('get user info failed');
  }
}
