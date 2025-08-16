import React from 'react';
import { useAttendance } from '../../contexts/attendance/AttendanceContext';

const Attendance = () => {
  const {
    currentAttendance,
    todayStats,
    attendanceHistory,
    checkIn,
    checkOut,
    isLoading,
    error
  } = useAttendance();

  const handleCheckIn = async () => {
    await checkIn();
  };

  const handleCheckOut = async () => {
    await checkOut();
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-300">Attendance</h1>
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded shadow flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-gray-700 dark:text-gray-200">Today's Status:</div>
          <div className="text-lg">
            {todayStats.status === 'checked-in' && <span className="text-green-600">Checked In</span>}
            {todayStats.status === 'checked-out' && <span className="text-yellow-600">Checked Out</span>}
            {todayStats.status === 'not-checked-in' && <span className="text-gray-500">Not Checked In</span>}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Check-in: {todayStats.checkInTime ? new Date(todayStats.checkInTime).toLocaleTimeString() : '--'}<br />
            Check-out: {todayStats.checkOutTime ? new Date(todayStats.checkOutTime).toLocaleTimeString() : '--'}
          </div>
        </div>
        <div className="flex gap-2">
          {todayStats.status !== 'checked-in' && (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleCheckIn}
              disabled={isLoading}
            >
              Check In
            </button>
          )}
          {todayStats.status === 'checked-in' && (
            <button
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              onClick={handleCheckOut}
              disabled={isLoading}
            >
              Check Out
            </button>
          )}
        </div>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <h2 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">Recent Attendance</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Check In</th>
              <th className="px-4 py-2 text-left">Check Out</th>
              <th className="px-4 py-2 text-left">Total Hours</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceHistory.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-2 text-center text-gray-500">No attendance records found.</td>
              </tr>
            )}
            {attendanceHistory.map((record) => (
              <tr key={record.id} className="border-t border-gray-100 dark:border-gray-700">
                <td className="px-4 py-2">{record.date}</td>
                <td className="px-4 py-2">{record.checkInTime}</td>
                <td className="px-4 py-2">{record.checkOutTime}</td>
                <td className="px-4 py-2">{record.totalHours}</td>
                <td className="px-4 py-2 capitalize">{record.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;