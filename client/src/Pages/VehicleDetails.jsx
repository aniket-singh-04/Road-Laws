import React from "react";

export default function VehicleDetails() {
  const vehicle = {
    vehicleNumber: "MP04AB1234",
    ownerName: "Ketan Kumar",
    vehicleType: "Motorcycle",
    manufacturer: "Honda",
    model: "Shine 125",
    fuelType: "Petrol",
    registrationDate: "12 Jan 2023",

    insurance: {
      status: "Valid",
      expiry: "15 Dec 2026",
    },

    puc: {
      status: "Valid",
      expiry: "20 Aug 2026",
    },

    rc: {
      status: "Valid",
      expiry: "Lifetime",
    },

    challan: {
      pending: 1,
      amount: "₹500",
    },

    complianceStatus: "Yellow",
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Green":
        return "bg-green-100 text-green-700";
      case "Yellow":
        return "bg-yellow-100 text-yellow-700";
      case "Orange":
        return "bg-orange-100 text-orange-700";
      case "Red":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="pt-15 bg-slate-100">

      {/* Header */}
      <div className="bg-blue-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold">
            Vehicle Compliance Dashboard
          </h1>

          <p className="text-blue-100 mt-2">
            Vehicle verification and document monitoring
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* Vehicle Number */}
        <div className="bg-white rounded-3xl shadow p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">

            <div>
              <h2 className="text-3xl font-bold">
                {vehicle.vehicleNumber}
              </h2>

              <p className="text-gray-500 mt-1">
                Registered Vehicle
              </p>
            </div>

            <div
              className={`mt-4 md:mt-0 px-5 py-2 rounded-full font-semibold ${getStatusColor(
                vehicle.complianceStatus
              )}`}
            >
              {vehicle.complianceStatus} Status
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">

          <div className="bg-white rounded-3xl shadow p-6">
            <h3 className="text-xl font-bold mb-4">
              Vehicle Information
            </h3>

            <div className="space-y-3">
              <p><strong>Owner:</strong> {vehicle.ownerName}</p>
              <p><strong>Type:</strong> {vehicle.vehicleType}</p>
              <p><strong>Manufacturer:</strong> {vehicle.manufacturer}</p>
              <p><strong>Model:</strong> {vehicle.model}</p>
              <p><strong>Fuel Type:</strong> {vehicle.fuelType}</p>
              <p><strong>Registration:</strong> {vehicle.registrationDate}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow p-6">
            <h3 className="text-xl font-bold mb-4">
              Challan Status
            </h3>

            <div className="space-y-3">
              <p>
                <strong>Pending Challans:</strong>{" "}
                {vehicle.challan.pending}
              </p>

              <p>
                <strong>Total Due:</strong>{" "}
                {vehicle.challan.amount}
              </p>

              <button className="bg-red-600 text-white px-5 py-2 rounded-xl">
                Pay Challan
              </button>
            </div>
          </div>

        </div>

        {/* Documents */}
        <div className="bg-white rounded-3xl shadow p-6 mt-6">
          <h3 className="text-xl font-bold mb-6">
            Document Status
          </h3>

          <div className="grid md:grid-cols-3 gap-6">

            {/* RC */}
            <div className="border rounded-2xl p-5">
              <h4 className="font-bold text-lg">RC</h4>

              <p className="mt-3 text-green-600 font-semibold">
                {vehicle.rc.status}
              </p>

              <p className="text-gray-500 mt-2">
                Expiry: {vehicle.rc.expiry}
              </p>
            </div>

            {/* Insurance */}
            <div className="border rounded-2xl p-5">
              <h4 className="font-bold text-lg">
                Insurance
              </h4>

              <p className="mt-3 text-green-600 font-semibold">
                {vehicle.insurance.status}
              </p>

              <p className="text-gray-500 mt-2">
                Expiry: {vehicle.insurance.expiry}
              </p>
            </div>

            {/* PUC */}
            <div className="border rounded-2xl p-5">
              <h4 className="font-bold text-lg">
                PUC Certificate
              </h4>

              <p className="mt-3 text-green-600 font-semibold">
                {vehicle.puc.status}
              </p>

              <p className="text-gray-500 mt-2">
                Expiry: {vehicle.puc.expiry}
              </p>
            </div>

          </div>
        </div>

        {/* Compliance Explanation */}
        <div className="bg-white rounded-3xl shadow p-6 mt-6">
          <h3 className="text-xl font-bold mb-4">
            Compliance Status Meaning
          </h3>

          <div className="space-y-4">

            <div className="bg-green-100 p-4 rounded-xl">
              🟢 Green – All documents valid, no pending issues.
            </div>

            <div className="bg-yellow-100 p-4 rounded-xl">
              🟡 Yellow – Minor issue or document nearing expiry.
            </div>

            <div className="bg-orange-100 p-4 rounded-xl">
              🟠 Orange – Immediate action required.
            </div>

            <div className="bg-red-100 p-4 rounded-xl">
              🔴 Red – Vehicle may be prohibited from road use until compliance.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}