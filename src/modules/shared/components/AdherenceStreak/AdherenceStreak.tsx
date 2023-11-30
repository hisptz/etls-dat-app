import React, { useState } from "react";
import styles from "./adherenceStreak.module.css";
import { Tooltip } from "react-tooltip";
import i18n from "@dhis2/d2-i18n";
import { isEmpty } from "lodash";

export interface DateEvent {
	date: string;
	event: "enrolled" | "takenDose" | "notTakenDose";
}

interface CalendarProps {
	events: DateEvent[];
	frequency: "Daily" | "Weekly" | "Monthly" | string;
}

function AdherenceStreak({ events, frequency }: CalendarProps) {
	const cellColors = {
		enrolled: "blue",
		takenDose: "green",
		notTakenDose: "red",
	};
	const month = new Date().getMonth();
	const year = new Date().getFullYear();

	const [currentMonth] = useState(month);
	const [currentYear] = useState(year);

	const formatDate = (date: Date) => {
		const options = {
			year: "numeric",
			month: "short",
			day: "numeric",
		};
		return date.toLocaleDateString(undefined, options);
	};

	const renderDailyCalendar = () => {
		const calendarCells = [];

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = 0; i < 7; i++) {
			const cellDate = new Date(today);
			cellDate.setDate(today.getDate() + i - 6);
			let cellColor = "";

			for (const event of events) {
				const eventDate = new Date(event.date);
				eventDate.setHours(0, 0, 0, 0);

				if (eventDate.getTime() === cellDate.getTime()) {
					cellColor = cellColors[event.event];
					break;
				}
			}

			const tooltipId = `daily-tooltip-${cellColor + i}`;
			const tooltipContent = i18n.t(
				`Date: ${formatDate(cellDate)} Status: ${
					cellColor
						? cellColor == "green"
							? "Dose Taken"
							: cellColor == "blue"
							? "Enrolled"
							: "Dose Missed"
						: "N/A"
				}`,
			);

			calendarCells.push(
				<>
					<div
						key={i}
						className={`${styles["calendar-cell"]} ${styles[cellColor]}`}
						style={{ fontSize: "18px" }}
						data-tooltip-id={tooltipId}
					></div>

					<Tooltip
						id={tooltipId}
						content={tooltipContent}
						delayShow={500}
						closeOnResize
						place="bottom"
					/>
				</>,
			);
		}

		return calendarCells;
	};

	const renderMonthlyCalendar = () => {
		const calendarMonths = [];

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		for (let i = -6; i <= 0; i++) {
			const targetMonth = new Date(
				today.getFullYear(),
				today.getMonth() + i,
				1,
			);

			const monthEvents = events.filter((event) => {
				const eventDate = new Date(event.date);
				eventDate.setHours(0, 0, 0, 0);
				return (
					eventDate.getFullYear() === targetMonth.getFullYear() &&
					eventDate.getMonth() === targetMonth.getMonth()
				);
			});

			const monthStreakColor =
				monthEvents.length > 0
					? cellColors[monthEvents[0].event]
					: "N/A";

			const tooltipId = `monthly-tooltip-${monthStreakColor + i}`;
			const tooltipContent = i18n.t(
				`Month: ${targetMonth.toLocaleString("default", {
					month: "long",
				})} \n Status: ${
					!isEmpty(monthStreakColor)
						? monthStreakColor == "green"
							? "Dose Taken"
							: monthStreakColor == "blue"
							? "Enrolled"
							: monthStreakColor == "red"
							? "Dose Missed"
							: "N/A"
						: "N/A"
				}`,
			);

			calendarMonths.push(
				<>
					<div
						key={i}
						className={`${styles["calendar-cell"]} ${styles[monthStreakColor]}`}
						style={{ fontSize: "18px" }}
						data-tooltip-id={tooltipId}
					></div>

					<Tooltip
						id={tooltipId}
						content={tooltipContent}
						delayShow={500}
						closeOnResize
						place="bottom"
					/>
				</>,
			);
		}

		return calendarMonths;
	};

	const renderWeeklyCalendar = () => {
		const calendarCells = [];
		const weeksInMonth = 7;
		for (let week = 1; week <= weeksInMonth; week++) {
			let weekColor = "";

			const startDate = new Date(
				currentYear,
				currentMonth,
				(week - 1) * 7 + 1,
			);
			const endDate = new Date(
				currentYear,
				currentMonth,
				week == 4 ? week * 8 : week * 7,
			);

			for (const event of events) {
				const eventDate = new Date(event.date);
				if (eventDate >= startDate && eventDate <= endDate) {
					weekColor = cellColors[event.event];
					break;
				}
			}
			const tooltipId = `weekly-tooltip-${weekColor + week}`;
			const tooltipContent = i18n.t(
				`Week: ${week}\nStatus: ${
					weekColor
						? weekColor == "green"
							? "Dose Taken"
							: weekColor == "blue"
							? "Enrolled"
							: "Dose Missed"
						: "N/A"
				}`,
			);
			calendarCells.push(
				<>
					<div
						key={`before-${week}`}
						className={`${styles["calendar-week-cell"]} ${styles[weekColor]}`}
						style={{ fontSize: "18px" }}
						data-tooltip-id={tooltipId}
					></div>

					<Tooltip
						id={tooltipId}
						content={tooltipContent}
						delayShow={500}
						closeOnResize
						place="bottom"
					/>
				</>,
			);
		}

		return calendarCells;
	};

	return (
		<>
			{frequency === "Daily" ? (
				<div className={styles["calendar"]}>
					{renderDailyCalendar()}
				</div>
			) : frequency === "Weekly" ? (
				<div className={styles["calendar-week"]}>
					{renderWeeklyCalendar()}
				</div>
			) : (
				<div className={styles["calendar-monthly"]}>
					{renderMonthlyCalendar()}
				</div>
			)}
		</>
	);
}

export default AdherenceStreak;
