import Leaderboard from '../Dashboard/Leaderboard';

const FriendLeaderboard = ({ user }) => {
  return (
    <div className="dashboard-card">
      <Leaderboard currentUser={user} showFriendsOnly={true} />
    </div>
  );
};

export default FriendLeaderboard;