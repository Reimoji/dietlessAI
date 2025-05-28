import { Link } from 'lucide-react';
import { Suspense } from 'react';
import { Login } from '../login';

export default function SignUpPage() {
  return (
    <Suspense>
      <Login mode='signup' />
      {/*// Add this near the bottom of the form, perhaps above the submit button*/}
      <div className='text-sm text-center mt-4'>
        <span className='text-muted-foreground'>Already have an account? </span>
        <Link href='/sign-in' className='font-medium text-primary hover:text-primary/90'>
          Sign in
        </Link>
        <span className='text-muted-foreground'> or </span>
        <Link href='/forgot-password' className='font-medium text-primary hover:text-primary/90'>
          Reset password
        </Link>
      </div>
    </Suspense>
  );
}
