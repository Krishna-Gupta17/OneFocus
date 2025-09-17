import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Download } from 'lucide-react';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RealTimeChart = () => {
  const [users, setUsers] = useState([
    {
      name: 'Fabitslowe',
      color: '#00D4FF',
      data: [20, 25, 35, 60, 85, 95, 80, 75, 85, 90],
      currentTime: '10:55',
    },
    {
      name: 'Vibtyont',
      color: '#FF1E8E',
      data: [15, 30, 45, 70, 60, 45, 80, 110, 130, 125],
      currentTime: '09:15',
    },
    {
      name: 'Cleoner',
      color: '#00FF7F',
      data: [25, 20, 35, 50, 40, 30, 25, 50, 85, 100],
      currentTime: '08:22',
    },
  ]);

  const [labels, setLabels] = useState([
    '100',
    '150',
    '190',
    '190',
    '190',
    '190',
    '190',
    '190',
    '190',
    '190',
  ]);

  const chartRef = useRef(null);

  // Generate random time between 15–120 seconds
  const generateRandomTime = () => Math.floor(Math.random() * 105) + 15;

  // Generate random timestamp
  const generateRandomTimestamp = () => {
    const now = new Date();
    const randomMinutes = Math.floor(Math.random() * 60);
    const randomHours = Math.floor(Math.random() * 24);
    now.setHours(randomHours, randomMinutes);
    return now.toTimeString().slice(0, 5);
  };

  // Update data every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          data: [...user.data.slice(1), generateRandomTime()],
          currentTime: generateRandomTimestamp(),
        }))
      );

      setLabels((prevLabels) => [
        ...prevLabels.slice(1),
        String(parseInt(prevLabels[prevLabels.length - 1]) + 10),
      ]);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels,
    datasets: users.map((user) => ({
      label: user.name,
      data: user.data,
      borderColor: user.color,
      backgroundColor: `${user.color}20`,
      fill: false,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: user.color,
      pointBorderColor: user.color,
      pointBorderWidth: 2,
      borderWidth: 3,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#333333',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context) => `Game Round: ${context[0].label}`,
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.y}s`,
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: 'Game Progress',
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
      y: {
        display: true,
        min: 0,
        max: 140,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            size: 12,
          },
          stepSize: 20,
        },
        title: {
          display: true,
          text: 'Time to Complete (seconds)',
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        hoverRadius: 8,
      },
    },
    animation: {
      duration: 500,
      easing: 'easeInOutQuart',
    },
  };

  const downloadChart = () => {
    if (chartRef.current) {
      const chartInstance = chartRef.current;
      const url = chartInstance.toBase64Image();
      const link = document.createElement('a');
      link.download = 'game-performance-chart.png';
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-2xl font-bold">Real Time</h2>
        <button
          onClick={downloadChart}
          className="p-2 text-white hover:text-blue-400 transition-colors duration-200 hover:bg-gray-800 rounded-lg"
          title="Download Chart"
        >
          <Download size={20} />
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 mb-6">
        {users.map((user, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: user.color }}
            />
            <span className="text-white font-medium text-sm">
              {user.name}
            </span>
            <span
              className="text-xs px-2 py-1 rounded font-mono"
              style={{
                color: user.color,
                backgroundColor: `${user.color}20`,
              }}
            >
              {user.currentTime}
            </span>
          </div>
        ))}
      </div>

      {/* Chart Container */}
      <div className="relative h-96">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 mt-4">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-gray-400 text-xs">
          Live • Updates every minute
        </span>
      </div>
    </div>
  );
};

export default RealTimeChart;
