Date.now = Date.now || function() { return +new Date; }; 
var chosenDate;
var editing = false;
var eventToEdit;

$('#dayCareCalendar').fullCalendar({
    header: {
        left:   '',
        center: '',
        right:  ''
    },
    timeFormat: 'H:mm{ - H:mm }',
    firstDay : 1,
    year: 2013,
    month: 6,
    dayNames: ["sunnuntai", "maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai"],
    dayNamesShort : ["su", "ma", "ti", "ke", "to", "pe", "la"],
    monthNames : ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"],
    monthNamesShort : ["tammi", "helmi", "maalis", "huhti", "touko", "kesä", "heinä", "elo", "syys", "loka", "marras", "joulu"],
    selectable : true,
    select : function( startDate, endDate, allDay, jsEvent, view ){
    	chosenDate = new Array();
    	var start = startDate.getTime();
    	chosenDate[0] = startDate;
    	var timespan = endDate.getTime() - start;
    	while(timespan > 0){
    		start += 86400000;
    		chosenDate.push(new Date(start));
    		timespan -= 86400000;
    	}
    	$('#addDayCareModal').modal();
    },
    eventRender : function( event, element, view ) {
    	element.append("<a onclick='removeEvent(\""+event.id+"\")' href='#'><img src='/img/delete.png' /></a><a onclick='editEvent(\""+event.id+"\")' href='#'><img src='/img/edit.png' /></a>");
    	return element;
    }
});
$('#dayCareTime .time').timepicker({
	'scrollDefaultNow': true,
	'showDuration': true,
	'timeFormat': 'H:i'
});

$('#dayCareTime').datepair();

$('#saveCareBtn').click(function(){
	var careTime = $('#dayCareTime').datepair('getTimeDiff');
	var basedate;
	if(editing){
		editCalendarEntry();
	}else{
		if(careTime != 0){
			if(careTime < 0){
				careTime = 86400 - $('#dayCareStarted').timepicker('getSecondsFromMidnight') + $('#dayCareEnded').timepicker('getSecondsFromMidnight')
			}else{
				careTime = careTime / 1000;
			}
			for(var i = 0; i < chosenDate.length;i++){
				basedate = chosenDate[i].getTime() / 1000;
				var careStart = basedate + $('#dayCareStarted').timepicker('getSecondsFromMidnight');
				var careEnd = careStart + careTime;
				var eventTitle = "("+ careTime / 3600+" tuntia)";
				addCalanderEvent(careStart, careEnd, eventTitle, Date.now()+i, careTime);
			}
		    updateDayCareClass();
		    $.modal.close();
		}
	}
});

$('#addDayCareModal').on($.modal.CLOSE, function(event, modal) {
	$(".time").val("");
});

updateDayCareClass();

function editCalendarEntry(){
	var careTime = $('#dayCareTime').datepair('getTimeDiff');
	var basedate = eventToEdit.start.getTime();
	var timeOverMidnight = eventToEdit.start.getHours() * 3600000;
	timeOverMidnight += eventToEdit.start.getMinutes() * 60000;
	basedate -= timeOverMidnight;
	basedate = basedate / 1000;
	if(careTime != 0){
		if(careTime < 0){
			careTime = 86400 - $('#dayCareStarted').timepicker('getSecondsFromMidnight') + $('#dayCareEnded').timepicker('getSecondsFromMidnight')
		}else{
			careTime = careTime / 1000;
		}
		var careStart = basedate + $('#dayCareStarted').timepicker('getSecondsFromMidnight');
		var careEnd = careStart + careTime;
		var eventTitle = "("+ careTime / 3600+" tuntia)";
		updateCalendarEvent(careStart, careEnd, eventTitle, careTime);
	}
}

function addCalanderEvent(start, end, title, id, caretime) {
    var eventObject = {
    	id: id,
	    title: title,
	    start: start,
	    end: end,
	    caretime: caretime,
	    allDay : false
    };
    $('#dayCareCalendar').fullCalendar('renderEvent', eventObject, true);
    return eventObject;
}

function updateCalendarEvent(start, end, title, caretime){
	eventToEdit.start = start;
	eventToEdit.end = end;
	eventToEdit.title = title;
	eventToEdit.caretime = caretime;
    $('#dayCareCalendar').fullCalendar('updateEvent', eventToEdit);
    updateDayCareClass();
	editing = false;
	$.modal.close();
};

function removeEvent(id){
	$('#dayCareCalendar').fullCalendar( 'removeEvents', id );
	updateDayCareClass();
}
function editEvent(id){
	var event = $('#dayCareCalendar').fullCalendar( 'clientEvents', id )[0];
	$('#dayCareStarted').timepicker('setTime', event.start);
	$('#dayCareEnded').timepicker('setTime', event.end);
	editing = true;
	eventToEdit = event;
	$('#addDayCareModal').modal();
}
function updateDayCareClass(){
	var totalCare = 0;
	var events = $('#dayCareCalendar').fullCalendar( 'clientEvents');
	for(var i = 0; i < events.length;i++){
		totalCare += events[i].caretime;
	}
	$("#dayCareInfo tr").parent().find('tr').removeClass("selected");
	$(".indicatorImg").remove();
	var careIndex = getDayCareIndex(totalCare / 3600);
	$("#dayCareTotal").html(totalCare / 3600);
	$("#dayCareClass_"+careIndex).addClass("selected");
	$("#dayCareClass_"+careIndex).find(".percentageValue").append("<img class='indicatorImg' src='/img/arrow.png' />");
}
function getDayCareIndex(hours){
	if(hours == 0){
		return 1;
	}else if(hours > 0 && hours <= 35){
		return 2;
	}else if(hours > 35 && hours <= 60){
		return 3;
	}else if(hours > 60 && hours <= 85){
		return 4;
	}else if(hours > 85 && hours <= 115){
		return 5;
	}else if(hours > 115 && hours <= 135){
		return 6;
	}else if(hours > 135 && hours <= 160){
		return 7;
	}else if(hours > 160){
		return 8;
	}else{
		return 1;
	}
	
}
