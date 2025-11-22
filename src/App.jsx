import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Dumbbell, Activity } from 'lucide-react';

const FitnessCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [workouts, setWorkouts] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [workoutType, setWorkoutType] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('fitnessWorkouts');
    if (saved) {
      setWorkouts(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fitnessWorkouts', JSON.stringify(workouts));
  }, [workouts]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getWorkoutForDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const key = formatDateKey(date);
    return workouts[key] || [];
  };

  const addWorkout = () => {
    if (!selectedDate || !workoutType) return;
    
    const key = formatDateKey(selectedDate);
    const newWorkout = {
      id: Date.now(),
      type: workoutType,
      notes: workoutNotes,
      timestamp: new Date().toISOString()
    };
    
    setWorkouts(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), newWorkout]
    }));
    
    setShowAddModal(false);
    setWorkoutType('');
    setWorkoutNotes('');
  };

  const deleteWorkout = (dateKey, workoutId) => {
    setWorkouts(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(w => w.id !== workoutId)
    }));
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const renderCalendar = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
    
    for (let i = 0; i < totalCells; i++) {
      const day = i - startingDayOfWeek + 1;
      const isValidDay = day > 0 && day <= daysInMonth;
      const date = isValidDay ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
      const dateKey = date ? formatDateKey(date) : '';
      const dayWorkouts = isValidDay ? getWorkoutForDate(day) : [];
      const isToday = date && date.toDateString() === new Date().toDateString();
      
      days.push(
        <div
          key={i}
          onClick={() => {
            if (isValidDay) {
              setSelectedDate(date);
              setShowAddModal(true);
            }
          }}
          className={`aspect-square flex flex-col items-center justify-start p-1 border border-gray-700 ${
            isValidDay ? 'bg-gray-800 cursor-pointer active:bg-gray-700' : 'bg-gray-900'
          } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
        >
          {isValidDay && (
            <>
              <div className={`text-xs font-semibold ${isToday ? 'text-blue-400' : 'text-gray-300'}`}>
                {day}
              </div>
              {dayWorkouts.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                  {dayWorkouts.slice(0, 3).map((w, idx) => (
                    <div
                      key={idx}
                      className="w-1.5 h-1.5 rounded-full bg-green-500"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-3 hover:bg-white/10 rounded-full active:bg-white/20 transition"
          >
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-2xl font-bold">{monthName}</h1>
          <button
            onClick={() => navigateMonth(1)}
            className="p-3 hover:bg-white/10 rounded-full active:bg-white/20 transition"
          >
            <ChevronRight size={28} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-7 gap-2">
          {renderCalendar()}
        </div>
      </div>

      {/* Add Workout Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end z-50 animate-in fade-in duration-200">
          <div className="bg-gray-800 w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {selectedDate?.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setWorkoutType('');
                  setWorkoutNotes('');
                }}
                className="text-gray-400 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Existing Workouts */}
            {selectedDate && getWorkoutForDate(selectedDate.getDate()).length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Today's Workouts</h3>
                {getWorkoutForDate(selectedDate.getDate()).map((workout) => (
                  <div key={workout.id} className="bg-gray-700 p-3 rounded-lg mb-2 flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-green-400">{workout.type}</div>
                      {workout.notes && <div className="text-sm text-gray-300 mt-1">{workout.notes}</div>}
                    </div>
                    <button
                      onClick={() => deleteWorkout(formatDateKey(selectedDate), workout.id)}
                      className="text-red-400 text-xl"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Workout */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Workout Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Strength', 'Cardio', 'Yoga', 'Sports', 'Flexibility', 'Rest Day'].map(type => (
                    <button
                      key={type}
                      onClick={() => setWorkoutType(type)}
                      className={`p-3 rounded-lg font-semibold transition ${
                        workoutType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Notes (Optional)</label>
                <textarea
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="Duration, exercises, sets..."
                  className="w-full bg-gray-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <button
                onClick={addWorkout}
                disabled={!workoutType}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 rounded-lg active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessCalendar;