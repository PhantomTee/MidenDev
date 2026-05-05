import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { taskId, githubUsername, twitterId, telegramUsername } = await req.json();

    if (taskId === 't1') { // Twitter Follow @PolygonMiden
      const bearer = process.env.TWITTER_BEARER_TOKEN;
      if (!bearer) throw new Error('TWITTER_BEARER_TOKEN not configured in environment');
      if (!twitterId) throw new Error('Twitter ID missing from profile');
      
      const url = `https://api.twitter.com/2/users/${twitterId}/following?max_results=1000`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } });
      const data = await res.json();
      if (data.errors) throw new Error(data.errors[0].detail);
      
      const isFollowing = data.data?.some((user: any) => user.username.toLowerCase() === 'polygonmiden');
      if (!isFollowing) return NextResponse.json({ verified: false, error: 'Not following @PolygonMiden on X' }, { status: 400 });
      return NextResponse.json({ verified: true });
    }

    if (taskId === 't2') { // GitHub Star 0xPolygonMiden/miden-vm
      if (!githubUsername) throw new Error('GitHub username missing from profile');
      const res = await fetch(`https://api.github.com/users/${githubUsername}/starred/0xPolygonMiden/miden-vm`, {
        headers: {
          'User-Agent': 'Miden-Applet',
          ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
        }
      });
      if (res.status === 204) return NextResponse.json({ verified: true });
      if (res.status === 404) return NextResponse.json({ verified: false, error: 'Repo not starred' }, { status: 400 });
      throw new Error(`GitHub API Error: ${res.status}`);
    }

    if (taskId === 't3') { // Discord
      throw new Error('Discord real verification requires a configured bot and DISCORD_GUILD_ID in environment variables');
    }

    if (taskId === 't5') { // Telegram
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN not configured in environment');
      throw new Error('Real Telegram verification via API requires a numeric user ID to use getChatMember. Since Telegram only provides strings initially, a bot interaction mapping is needed to fetch the numeric ID first.');
    }

    return NextResponse.json({ verified: false, error: 'Unknown task format' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ verified: false, error: error.message }, { status: 500 });
  }
}
