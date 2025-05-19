import { Suspense } from 'react';
import { Login } from '../login';
import { Link } from 'lucide-react';

export default function SignInPage() {
  return (
    <Suspense>
      <Login mode="signin" />
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:text-primary/90"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </Suspense>
  );
}
