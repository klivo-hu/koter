import Link from 'next/link';
import { Container } from '@/components/ui/container';

/** Primary site navigation. Landmark `nav` with descriptive links. */
export function Navbar() {
  return (
    <header className="border-b border-border">
      <Container>
        <nav aria-label="Primary" className="flex items-center justify-between py-4">
          <Link href="/" className="font-semibold">
            koter-gym
          </Link>
          <ul className="flex flex-wrap gap-6">
          <li>
            <Link href="/dashboard" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/reservations" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
              Reservations
            </Link>
          </li>
          <li>
            <Link href="/signup" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
              Sign Up
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
              About
            </Link>
          </li>
          <li>
            <Link href="/admin" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
              Admin
            </Link>
          </li>
          <li>
            <Link href="/contact" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
              Contact
            </Link>
          </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
