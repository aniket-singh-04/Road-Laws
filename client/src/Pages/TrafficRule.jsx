import React from "react";
import {
  Shield,
  Phone,
  FileText,
  Bike,
  Car,
  Smartphone,
  Wine,
  ParkingCircle,
  AlertTriangle,
} from "lucide-react";

export default function TrafficRulesPage() {
  const trafficRules = [
    {
      icon: <Bike size={40} className="text-blue-700" />,
      title: "Helmet Rules",
      description:
        "Wearing a BIS-certified helmet is mandatory for rider and pillion.",
      fine: "₹1,000",
      section: "MVA 129",
    },
    {
      icon: <Car size={40} className="text-green-600" />,
      title: "Seat Belt Rules",
      description: "Seat belts are mandatory for drivers and all passengers.",
      fine: "₹1,000",
      section: "CMVR 138(3)",
    },
    {
      icon: <Smartphone size={40} className="text-red-600" />,
      title: "Mobile Usage",
      description: "Using a mobile phone while driving is strictly prohibited.",
      fine: "₹5,000",
      section: "MVA 184",
    },
    {
      icon: <Wine size={40} className="text-red-600" />,
      title: "Drunk Driving",
      description:
        "Driving under the influence of alcohol is illegal and punishable.",
      fine: "₹10,000",
      section: "MVA 185",
    },
    {
      icon: <ParkingCircle size={40} className="text-blue-700" />,
      title: "Parking Rules",
      description: "Park only in designated areas. Avoid no-parking zones.",
      fine: "₹500",
      section: "Local Rules",
    },
  ];

  const safetyRules = [
    "Maintain safe distance from the vehicle ahead",
    "Use indicators before changing lanes",
    "Follow lane discipline",
    "Avoid overspeeding",
    "Give way to emergency vehicles",
    "Wear reflective gear while riding at night",
  ];

  return (
    <div className="pt-20 bg-slate-100 p-6">
      {/* Header */}{" "}
      <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-lg">
        {" "}
        <div className="grid md:grid-cols-5 gap-6 items-center">
          {" "}
          <div className="md:col-span-2">
            {" "}
            <h1 className="text-3xl font-bold">Maharashtra Traffic Rules </h1>
            ```
            <p className="text-blue-100 mt-2">
              Drive responsibly and follow the rules. Fines may vary according
              to violations.
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Max Speed (Urban)</p>
            <h2 className="text-4xl font-bold">50</h2>
            <p>km/h</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Max Speed (Highway)</p>
            <h2 className="text-4xl font-bold">80</h2>
            <p>km/h</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Mandatory Safety</p>
            <h2 className="text-xl font-semibold">Helmet & Seat Belt</h2>
          </div>
        </div>
      </div>
      {/* Main Grid */}
      <div className="grid lg:grid-cols-4 gap-6 mt-6">
        {/* Left Content */}
        <div className="lg:col-span-3">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {trafficRules.map((rule, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition"
              >
                <div>{rule.icon}</div>

                <h3 className="text-xl font-semibold mt-4">{rule.title}</h3>

                <p className="text-gray-600 text-sm mt-2">{rule.description}</p>

                <div className="mt-4">
                  <p className="text-red-600 font-bold">Fine: {rule.fine}</p>

                  <p className="text-gray-500 text-sm">
                    Section: {rule.section}
                  </p>
                </div>

                <button className="mt-4 text-blue-700 font-medium">
                  View Details →
                </button>
              </div>
            ))}
          </div>

          {/* Road Safety */}
          <div className="bg-white rounded-2xl p-6 shadow mt-6">
            <h2 className="text-2xl font-bold mb-5">Road Safety Guidelines</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {safetyRules.map((rule, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-green-50"
                >
                  <AlertTriangle size={20} className="text-green-600 mt-1" />

                  <p>{rule}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
            <p className="text-blue-800">
              Rules and penalties may be updated by the Transport Department.
              Please verify the latest notification before taking action.
            </p>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 shadow">
            <h2 className="font-bold text-xl mb-4">Quick Info</h2>

            <div className="space-y-3">
              <p className="flex items-center gap-2">
                <Phone size={16} />
                Traffic Helpline: 103
              </p>

              <p className="flex items-center gap-2">
                <Phone size={16} />
                Ambulance: 108
              </p>

              <p className="flex items-center gap-2">
                <Phone size={16} />
                Police: 100
              </p>

              <p className="flex items-center gap-2">
                <Phone size={16} />
                Emergency: 112
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
            <h2 className="font-bold text-xl mb-4">Downloads</h2>

            <div className="space-y-3">
              <button className="w-full flex items-center gap-2 text-left hover:text-blue-700">
                <FileText size={18} />
                Traffic Rules PDF
              </button>

              <button className="w-full flex items-center gap-2 text-left hover:text-blue-700">
                <FileText size={18} />
                Fine Structure PDF
              </button>

              <button className="w-full flex items-center gap-2 text-left hover:text-blue-700">
                <FileText size={18} />
                Road Signs Guide
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow">
            <h2 className="font-bold text-xl mb-4">Compliance</h2>

            <div className="space-y-3">
              <div className="bg-green-100 text-green-700 p-3 rounded-lg">
                Helmet Mandatory
              </div>

              <div className="bg-green-100 text-green-700 p-3 rounded-lg">
                Seat Belt Mandatory
              </div>

              <div className="bg-yellow-100 text-yellow-700 p-3 rounded-lg">
                Carry Valid Documents
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
