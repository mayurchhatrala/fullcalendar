$(document).ready(function()
{
        var calendar = $('#calendar').fullCalendar({
            header:{
                left: 'prev,next today',
                center: 'title',
                right: 'agendaWeek,agendaDay'
            },
            defaultView: 'month',
            editable: true,
            selectable: true,
            allDaySlot: true,
            events: "index.php?view=1",
            // using ajax
            /*events: function(start, end, timezone, callback) {
                $.ajax({
                    url: 'index.php?view=1',
                    dataType: 'json',
                    data: {
                        // our hypothetical feed requires UNIX timestamps
                        start: start.format(),
                        end: end.format()
                    },
                    success: function(doc) {
                        var events = [];
                        $(doc).each(function() {
                            events.push({
                                title: $(this).attr('title'),
                                start: $(this).attr('start') // will be parsed
                            });
                        });
                        callback(events);
                    }
                });
            },*/
            eventClick:  function(event, jsEvent, view) {
                endtime = $.fullCalendar.moment(event.end).format('h:mm');
                starttime = $.fullCalendar.moment(event.start).format('dddd, MMMM Do YYYY, h:mm');
                var mywhen = starttime + ' - ' + endtime;

                if(event.blocked != 1){
                  $('#modalTitle').html(event.title);
                  $('#modalWhen').text(mywhen);
                  $('#eventID').val(event.id);
                  $('#calendarModal').modal();
                } else if(event.blocked == 1 && event.user_id == '2'){
                  $('#modalTitle').html(event.title);
                  $('#modalWhen').text(mywhen);
                  $('#eventID').val(event.id);
                  $('#calendarModal').modal();
                } else {
                  alert("Event already booked.");
                  return false;
                }
            },   
            //header and other values
            select: function(start, end, jsEvent,view) {
                endtime = $.fullCalendar.moment(end).format('h:mm');
                starttime = $.fullCalendar.moment(start).format('dddd, MMMM Do YYYY, h:mm');
                var mywhen = starttime + ' - ' + endtime;
                var mytime = starttime = $.fullCalendar.moment(start, "ddd MMM DD YYYY HH:mm:ss GMT-0400",true); 

                // to check particular date has any event
                if (!IsDateHasEvent(mytime)) {
                    selectedDate = mytime;
                    
                    // IF NO EVENT THEN OPE MODAL OF NEW
                    start = moment(start).format();
                    end = moment(end).format();
                    $('#createEventModal #startTime').val(start);
                    $('#createEventModal #endTime').val(end);
                    $('#createEventModal #when').text(mywhen);
                    $('#createEventModal').modal('toggle');
                }
                else {
                    alert("There is a event on same date. please select other date. ");
                }
           },
           eventDrop: function(event, delta){
               $.ajax({
                   url: 'index.php',
                   data: 'action=update&title='+event.title+'&start='+moment(event.start).format()+'&end='+moment(event.end).format()+'&id='+event.id ,
                   type: "POST",
                   success: function(json) {
                   //alert(json);
                   }
               });
           },           
        });
               
       $('#submitButton').on('click', function(e){
           // We don't want this to act as a link so cancel the link action
           e.preventDefault();
           doSubmit();
       });
       
       $('#deleteButton').on('click', function(e){
           // We don't want this to act as a link so cancel the link action
           e.preventDefault();
           doDelete();
       });
       
       function doDelete(){
           $("#calendarModal").modal('hide');
           var eventID = $('#eventID').val();
           $.ajax({
               url: 'index.php',
               data: 'action=delete&id='+eventID,
               type: "POST",
               success: function(json) {
                  if(json == 1)
                    $("#calendar").fullCalendar('removeEvents',eventID);
                  else
                    return false;
               }
           });
       }
       function doSubmit(){
           $("#createEventModal").modal('hide');
           var title = $('#title').val();
           var startTime = $('#startTime').val();
           var endTime = $('#endTime').val();
           
           $.ajax({
               url: 'index.php',
               data: 'action=add&title='+title+'&start='+startTime+'&end='+endTime,
               type: "POST",
               success: function(json) {
                   $("#calendar").fullCalendar('renderEvent',
                   {
                       id: json.id,
                       title: title,
                       start: startTime,
                       end: endTime,
                   },
                   true);
               }
           });
       }

      // check if this day has an event before
      function IsDateHasEvent(date) {
          var allEvents = [];
          allEvents = $('#calendar').fullCalendar('clientEvents');
          var event = $.grep(allEvents, function (v) {
              return +v.start === +date;
          });
          return event.length > 0;
      }
});