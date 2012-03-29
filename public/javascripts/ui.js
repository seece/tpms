$(".notice").click(function (e) {
	$(this).slideUp();
});

// Datepicker defaults
$.datepicker.setDefaults({
	closeText: 'Done',
	prevText: 'Prev',
	nextText: 'Next',
	currentText: 'Today',
	monthNames: ['January','February','March','April','May','June',
	'July','August','September','October','November','December'],
	monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
	dayNamesMin: ['Su','Mo','Tu','We','Th','Fr','Sa'],
	weekHeader: 'Wk',
	dateFormat: 'yy-mm-dd',
	firstDay: 1,
	isRTL: false,
	showMonthAfterYear: false,
	yearSuffix: ''
});

// Prettify time that is in milliseconds
var prettifyDuration = function (diff)	{
	var days = Math.floor(diff / (24*60*60*1000));
	var hours = Math.floor((diff % (24*60*60*1000)) / (60*60*1000));
	var minutes = Math.floor((diff % (60*60*1000)) / (60*1000));
	var seconds = Math.floor((diff % (60*1000)) / (1000));
	var days_string = days > 0 ? days + " days " : "";
	return days_string+hours+"h " + minutes + "m " + seconds + "s";
}

$(document).ready(function () {
	// Initialize datepickers
	$("input#date").datepicker();

	// Update countdowns constantly
	$("span.countdown[data-diff]").each(function () {
		var $this = $(this),
			diff = Number($this.attr('data-diff')),
			lastCalled = Date.now(),
			interval;

		interval = window.setInterval(function () {
			var newDiff = diff - (Date.now() - lastCalled);
			if (newDiff < 0 && diff > 0) {
				// This ended. Prettify duration with 0 and stop this interval
				$this.text(prettifyDuration(0));
				window.clearInterval(interval);
				// Also do an AJAX request to refresh the body
				$.ajax({
					url: "",
					context: document.body,
					success: function(s,x){
						$(this).html(s);
					}
				});

				return;
			}
			diff = newDiff;
			lastCalled = Date.now();
			// If we're dealing with negative diff, use moment.js to create a nice string
			if (diff < 0) {
				$this.text(moment.humanizeDuration(diff) + ' ago');
			} else {
				$this.text(prettifyDuration(diff));
			}
		}, 100);
	});
});