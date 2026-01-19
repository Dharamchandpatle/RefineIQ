import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { BadgeCheck, Building2, Mail, MapPin, Phone, Shield } from "lucide-react";

const Profile = () => {
	const { user } = useAuth();

	const displayName = user?.name || "Refinery User";
	const displayEmail = user?.email || "user@iocl.com";
	const roleLabel = user?.role || "OPERATOR";

	return (
		<div className="space-y-6">
			<header>
				<h2 className="text-2xl font-semibold text-brand-blue">Profile</h2>
				<p className="text-sm text-slate-500">Account details and access overview.</p>
			</header>

			<div className="grid gap-6 lg:grid-cols-3">
				<Card className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
					<div className="flex items-center gap-4">
						<div className="w-14 h-14 rounded-full bg-[#003A8F]/10 text-brand-blue flex items-center justify-center text-xl font-semibold">
							{displayName.charAt(0).toUpperCase()}
						</div>
						<div>
							<p className="text-lg font-semibold text-slate-900">{displayName}</p>
							<p className="text-sm text-slate-500">{displayEmail}</p>
						</div>
					</div>

					<div className="mt-6 space-y-3 text-sm text-slate-600">
						<div className="flex items-center gap-2">
							<Mail className="w-4 h-4 text-brand-blue" />
							<span>{displayEmail}</span>
						</div>
						<div className="flex items-center gap-2">
							<Phone className="w-4 h-4 text-brand-blue" />
							<span>+91 98765 43210</span>
						</div>
						<div className="flex items-center gap-2">
							<MapPin className="w-4 h-4 text-brand-blue" />
							<span>IOCL Guwahati Refinery</span>
						</div>
					</div>
				</Card>

				<Card className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
					<h3 className="text-sm font-semibold text-brand-blue mb-4">Role & Access</h3>
					<div className="space-y-4 text-sm text-slate-600">
						<div className="flex items-center gap-2">
							<Shield className="w-4 h-4 text-brand-blue" />
							<span className="font-medium text-slate-800">{roleLabel}</span>
						</div>
						<div className="flex items-center gap-2">
							<BadgeCheck className="w-4 h-4 text-brand-blue" />
							<span>Access verified</span>
						</div>
						<div className="flex items-center gap-2">
							<Building2 className="w-4 h-4 text-brand-blue" />
							<span>Operations • Energy & Safety Intelligence</span>
						</div>
						<p className="text-xs text-slate-500">
							{roleLabel === "ADMIN"
								? "Admin access enabled for system-wide monitoring and dataset controls."
								: "Operator access enabled for day-to-day monitoring and alerts."}
						</p>
					</div>
				</Card>

				<Card className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
					<h3 className="text-sm font-semibold text-brand-blue mb-4">Recent Activity</h3>
					<div className="space-y-3 text-sm text-slate-600">
						<p>Last sign-in: Today, 08:40</p>
						<p>Location: Guwahati, Assam</p>
						<p>Security status: Active</p>
						<p>Session: Web Dashboard</p>
					</div>
				</Card>
			</div>
		</div>
	);
};

export default Profile;
