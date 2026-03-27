import React, { useRef } from 'react';
import {
  Chart as ChartJS,
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
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RealTimeChart = ({ users = [], seriesByUser = {}, checkpoints = [], updateIntervalSeconds = 10 }) => {

  const chartRef = useRef(null);

  const formatDuration = (seconds) => {
    const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getUserStats = (uid) => {
    const series = seriesByUser[uid] || [];
    if (series.length === 0) {
      return { currentDuration: '--:--', avgFocusText: '--' };
    }

    const lastPoint = series[series.length - 1];
    const focusSamples = series
      .filter((point) => point?.x > 0)
      .map((point) => Math.max(0, Math.min(200, (point.y / point.x) * 100)));

    const avgFocus = focusSamples.length
      ? focusSamples.reduce((sum, value) => sum + value, 0) / focusSamples.length
      : 0;

    return {
      currentDuration: formatDuration(lastPoint?.y || 0),
      avgFocusText: `${Math.round(avgFocus)}%`,
    };
  };

  const pointsCount = users.reduce(
    (max, user) => Math.max(max, (seriesByUser[user.uid] || []).length),
    0
  );

  const expectedLine = checkpoints.map((checkpoint) => ({ x: checkpoint, y: checkpoint }));

  const chartData = {
    datasets: [
      ...users.map((user) => ({
        label: user.name,
        data: seriesByUser[user.uid] || [],
        borderColor: user.color,
        backgroundColor: `${user.color}20`,
        fill: false,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: user.color,
        pointBorderColor: user.color,
        pointBorderWidth: 2,
        borderWidth: 3,
      })),
      {
        label: `Expected (${updateIntervalSeconds}s / ${updateIntervalSeconds}s)`,
        data: expectedLine,
        borderColor: 'rgba(255,255,255,0.55)',
        borderDash: [6, 6],
        fill: false,
        tension: 0,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    parsing: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: 'rgba(255, 255, 255, 0.85)',
          usePointStyle: true,
        },
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
          title: (context) => {
            const checkpoint = context?.[0]?.parsed?.x ?? 0;
            return `Checkpoint: ${checkpoint}s`;
          },
          label: (context) => {
            const actual = context.parsed.y;
            const expected = context.parsed.x;
            if (context.dataset.label.startsWith('Expected')) {
              return `Expected: ${expected}s`;
            }
            const delta = actual - expected;
            const deltaText = delta === 0 ? 'On track' : `${delta > 0 ? '+' : ''}${delta}s`;
            return `${context.dataset.label}: ${actual}s (${deltaText})`;
          },
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
        type: 'linear',
        display: true,
        min: 0,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          stepSize: updateIntervalSeconds,
          callback: (value) => `${value}s`,
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: `Elapsed Time (every ${updateIntervalSeconds}s checkpoint)`,
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
          text: 'Actual Completed Time (seconds)',
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
            {(() => {
              const stats = getUserStats(user.uid);
              return (
                <>
                  <span
                    className="text-xs px-2 py-1 rounded font-mono"
                    style={{
                      color: user.color,
                      backgroundColor: `${user.color}20`,
                    }}
                  >
                    Time: {stats.currentDuration}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-white/10 text-white/85">
                    Avg Focus: {stats.avgFocusText}
                  </span>
                </>
              );
            })()}
          </div>
        ))}
      </div>

      {/* Chart Container */}
      <div className="relative h-96">
        {pointsCount > 0 ? (
          <Line ref={chartRef} data={chartData} options={options} />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
            Waiting for progress updates...
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 mt-4">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-gray-400 text-xs">
          Live • Updates every {updateIntervalSeconds} seconds
        </span>
      </div>
    </div>
  );
};

export default RealTimeChart;
