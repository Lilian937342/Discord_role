import { TimestampStylesString } from "discord.js";

export const parseTime = (sec_num: number) => {
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - hours * 3600) / 60);
    var seconds = sec_num - hours * 3600 - minutes * 60;
    var parsedSeconds = String(seconds);
    var parsedHours = String(hours);
    var parsedMinutes = String(minutes);
    if (hours < 10) {
        parsedHours = "0" + hours;
    }
    if (minutes < 10) {
        parsedMinutes = "0" + minutes;
    }
    if (sec_num < 10) {
        parsedSeconds = "0" + seconds;
    }

    return `${parsedHours != "00" ? parsedHours + "hours, " : ""}${
        parsedMinutes != "00" ? parsedMinutes + "minutes, " : ""
    }${parsedSeconds} seconds`;
};


export const timeFormat = (time: number, style: TimestampStylesString) => {
    return `<t:${Math.floor(time/1000)}:${style}>`    
}