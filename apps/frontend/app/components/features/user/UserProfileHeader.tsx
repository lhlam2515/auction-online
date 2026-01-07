import { ProfileHeader } from "@/components/common";
import { RoleBadge } from "@/components/common/badges";

interface UserProfileHeaderProps {
  user: {
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string | null;
    ratingScore: number;
    ratingCount: number;
    sellerExpireDate: Date | string | null;
    role: string | null;
  };
  className?: string;
}

const UserProfileHeader = ({ user, className }: UserProfileHeaderProps) => {
  const badges = <RoleBadge role={user.role || "BIDDER"} />;

  return <ProfileHeader user={user} badges={badges} className={className} />;
};

export default UserProfileHeader;
