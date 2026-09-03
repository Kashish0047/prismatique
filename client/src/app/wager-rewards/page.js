import { redirect } from 'next/navigation';

// Wager Rewards was merged into the single "THE LEADERBOARD" page.
export default function WagerRewardsRedirect() {
  redirect('/rankings');
}
