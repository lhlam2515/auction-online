import React from "react";

import { TIME } from "@/constants/api";
import { getTimeRemaining } from "@/lib/utils";

function formatTimeRemaining(
  endTime: Date,
  shortTimeFormat: boolean
): {
  text: string;
  isUrgent: boolean;
} {
  const timeData = getTimeRemaining(endTime);

  if (timeData.isExpired) {
    return {
      text: "Đã kết thúc",
      isUrgent: true,
    };
  }

  const { days, hours, minutes, seconds } = timeData;
  const isUrgent = timeData.total < TIME.HOUR; // dưới 1 giờ

  let timeText = "";
  if (shortTimeFormat) {
    if (days > 0) timeText += `${days}d `;
    if (hours >= 0) timeText += `${hours.toString().padStart(2, "0")}h `;
    if (minutes >= 0) timeText += `${minutes.toString().padStart(2, "0")}m `;
    if (seconds >= 0 && days === 0)
      timeText += `${seconds.toString().padStart(2, "0")}s`;
  } else {
    if (days > 0) timeText += `${days} ngày `;
    if (hours >= 0) timeText += `${hours.toString().padStart(2, "0")} giờ `;
    if (minutes >= 0)
      timeText += `${minutes.toString().padStart(2, "0")} phút `;
    if (seconds >= 0 && days === 0)
      timeText += `${seconds.toString().padStart(2, "0")} giây `;
    timeText += "nữa";
  }

  return {
    text: timeText.trim(),
    isUrgent,
  };
}

// Custom hook để đếm ngược tự động
export default function useCountdown(
  endTime: Date,
  useShortTimeFormat: boolean
) {
  const [timeDisplay, setTimeDisplay] = React.useState(() =>
    formatTimeRemaining(endTime, useShortTimeFormat)
  );

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeDisplay(formatTimeRemaining(endTime, useShortTimeFormat));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, useShortTimeFormat]);
  return timeDisplay;
}
