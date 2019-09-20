/* This js file draw the gantt chart */
/* This requires to have the time library projectcm-time.js */

function redrawResourceChart(username){

	//drawResourcePanel(true, username.value, username.value);
	dynamicResources = document.getElementsByClassName('dynamic-resource')[0];
	// remove previous chart

	while(dynamicResources.hasChildNodes()){
		dynamicResources.removeChild(dynamicResources.firstChild);
	}
		
	drawResourcePanel(true, username.value, username.value);
}

function redrawGantt(){
        var taskID = arguments[0];
        var taskname_id = taskID + "_1";
        var taskname = document.getElementById(taskname_id).value;
        window.alert("redraw" + taskname);
}

function plotLegend(thisCanvas, arrayOfLegend, startPosX, startPosY, legendSize, fontSize)
{
	/* This Function shall draw the legend Rectangle on the canvas */
	canvasWidth = thisCanvas.offsetWidth;
	canvasHeight = thisCanvas.offsetHeight;
	//thisCanvas.width = thisCanvas.offsetWidth;
	//thisCanvas.height = thisCanvas.offsetHeight;

	legendEntryHeight = Math.floor(fontSize * 1.5);
	
	numberOfEntry = arrayOfLegend.length;

	if(numberOfEntry == 0){
		return;
	}
	
	var ctx = thisCanvas.getContext("2d");

	rectStartPosX = canvasWidth * startPosX;
	rectStartPosY = canvasHeight * startPosY;
	rectEndPosX = startPosX + legendSize;
	rectEndPosY = rectStartPosY + numberOfEntry * legendEntryHeight;

	ctx.beginPath();
	ctx.strokeStyle = "#000";
	ctx.fillStyle = "rgba(255,255,255,1.0)";
	ctx.fillRect(rectStartPosX, rectStartPosY, rectEndPosX, rectEndPosY);

	for(i=0; i< numberOfEntry; i++)
	{
		ctx.beginPath();
		entryLineStartPosX = rectStartPosX + 3;
		entryLineStartPosY = rectStartPosY + i*legendEntryHeight;
		entryLineEndPosX = entryLineStartPosX + 20;
		entryLineEndPosY = entryLineStartPosY;
		ctx.moveTo(entryLineStartPosX, entryLineStartPosY);
		ctx.lineTo(entryLineEndPosX, entryLineEndPosY);
		ctx.strokeStyle = arrayOfLegend[i][1];
		ctx.stroke();
		entryDescriptionPosX = entryLineEndPosX + 5;
		entryDescriptionPosY = entryLineEndPosY + 5;
		ctx.fillStyle = "#000";
		ctx.font = fontSize + "px";
		ctx.fillText(arrayOfLegend[i][0], entryDescriptionPosX, entryDescriptionPosY);
	}

} 

function plotPlannedAggregate(taskArray, startDate, endDate, matchUser, thisCanvas, lineColor, maxDay){
	/* This Function should return an array of aggregate manday */
	/* from a taskArray structure, it will count the number of  */
	/* aggregated mandays spent from certain startDate to endDate */
	/* if matchUser is provided, it will only count if the task */
	/* belongs to someone, otherwise, it will accumulate all work */
	var legend_suffix = " Planned";
	var legend_default_prefix = "Total ";
	var legend_top_padding = 0.02;
	var legend_spacing = 4 * legend_top_padding;
	var legend_font_size = "10px";

	aggregateX = [];
	aggregateY = [];	

	canvasWidth = thisCanvas.offsetWidth;
	canvasHeight = thisCanvas.offsetHeight;
	aggregateY_Start = -10;
	aggregateX_Start = 0;
        
	numDays = daysBetweenDate(startDate, endDate);

	var ctx = thisCanvas.getContext("2d");
	ctx.font = "0.5em";

	xUnitScale = canvasWidth/numDays;
	yAreaMax = 0.9;

	// Plot grid
	gridSpaceDay = Math.floor(maxDay/5);
	numOfGrid = Math.ceil(maxDay/gridSpaceDay);
	
	oneManDayPixel = yAreaMax * canvasHeight/(numOfGrid*gridSpaceDay);

	for(i=0; i <= numOfGrid; i++)
	{
		ctx.beginPath();
		ctx.moveTo(0,(canvasHeight-i*oneManDayPixel*gridSpaceDay));
		ctx.lineTo(canvasWidth, (canvasHeight-i*oneManDayPixel*gridSpaceDay));
		ctx.lineWidth = 0.5;
		ctx.stroke();
		ctx.fillText(i*gridSpaceDay, 2, (canvasHeight-i*oneManDayPixel*gridSpaceDay));
	}


	lastX = 0;
	lastY = 0;
	newY = 0;
	for(i=0; i < numDays; i++)
	{
		
		newX = i*xUnitScale;
		// Iterate each task each day
		for(j=0; j < taskArray.length; j++)
		{
			// check if this moving day is in any task
			// if it is in any task, check if it is the
			// user
			// if yes, calculate the average manday of this
			// task and add to the aggregate Y value
			// y value is interms of day
			moveDay = new Date(startDate.getTime() + i*24*60*60*1000);
			thisTaskPlannedStart = new Date(taskArray[j][2]);
			thisTaskPlannedEnd = new Date(taskArray[j][3]);
			if((daysBetweenDate(moveDay, thisTaskPlannedStart)<=0)&&(daysBetweenDate(moveDay, thisTaskPlannedEnd)>0))
			{
				//window.alert(moveDay);
				if(matchUser.trim()==""||matchUser.trim()==taskArray[j][6].trim()){
					totalResource = parseFloat(taskArray[j][7]);
					if(!isNaN(totalResource)){
						taskDuration = daysBetweenDate(thisTaskPlannedStart, thisTaskPlannedEnd);
					
						perDayResource = totalResource/taskDuration;
						newY = newY+perDayResource;
					}
				}

				
			}
		}

		// draw the new Point
		ctx.beginPath();
		ctx.fillStyle = lineColor;
		ctx.globalAlpha = 0.2;	
		ctx.lineWidth = 1;
		ctx.strokeStyle = lineColor;
		ctx.moveTo(lastX, canvasHeight - lastY*oneManDayPixel);
		ctx.lineTo(newX, canvasHeight - newY*oneManDayPixel);
		
		//ctx.stroke();
		ctx.lineTo(newX, canvasHeight);
		ctx.lineTo(lastX, canvasHeight);
		ctx.lineTo(lastX, canvasHeight - lastY*oneManDayPixel);
		ctx.fill();
		ctx.closePath();
		ctx.globalAlpha = 1.0;

		lastX = newX;
		lastY = newY;



	}
}

function plotActualAggregate(taskArray, startDate, endDate, matchUser, thisCanvas, lineColor, maxDay){
	/* This Function should return an array of aggregate manday */
	/* from a taskArray structure, it will count the number of  */
	/* aggregated mandays spent from certain startDate to endDate */
	/* if matchUser is provided, it will only count if the task */
	/* belongs to someone, otherwise, it will accumulate all work */
	

	aggregateX = [];
	aggregateY = [];	

	canvasWidth = thisCanvas.offsetWidth;
	canvasHeight = thisCanvas.offsetHeight;
	aggregateY_Start = -10;
	aggregateX_Start = 0;
        
	numDays = daysBetweenDate(startDate, endDate);

	var ctx = thisCanvas.getContext("2d");
	ctx.font = "0.5em";

	xUnitScale = canvasWidth/numDays;
	yAreaMax = 0.9;

	// Plot grid
	gridSpaceDay = Math.floor(maxDay/5);
	numOfGrid = Math.ceil(maxDay/gridSpaceDay);
	
	oneManDayPixel = yAreaMax * canvasHeight/(numOfGrid*gridSpaceDay);

	for(i=0; i <= numOfGrid; i++)
	{
		ctx.beginPath();
		ctx.moveTo(0,(canvasHeight-i*oneManDayPixel*gridSpaceDay));
		ctx.lineTo(canvasWidth, (canvasHeight-i*oneManDayPixel*gridSpaceDay));
		ctx.lineWidth = 0.5;
		ctx.stroke();
		ctx.fillText(i*gridSpaceDay, 2, (canvasHeight-i*oneManDayPixel*gridSpaceDay));
	}


	lastX = 0;
	lastY = 0;
	newY = 0;
	for(i=0; i < numDays; i++)
	{
		
		newX = i*xUnitScale;
		// Iterate each task each day
		for(j=0; j < taskArray.length; j++)
		{
			// check if this moving day is in any task
			// if it is in any task, check if it is the
			// user
			// if yes, calculate the average manday of this
			// task and add to the aggregate Y value
			// y value is interms of day
			moveDay = new Date(startDate.getTime() + i*24*60*60*1000);
			thisTaskActualStart = new Date(taskArray[j][4]);
			thisTaskActualEnd = new Date(taskArray[j][5]);
			if(!(isNaN(thisTaskActualStart) || isNaN(thisTaskActualEnd)))
			{
			
				if((daysBetweenDate(moveDay, thisTaskActualStart)<=0)&&(daysBetweenDate(moveDay, thisTaskActualEnd)>0))
				{
					//window.alert(moveDay);
					if(matchUser.trim()==""||matchUser.trim()==taskArray[j][6].trim()){
						totalResource = parseFloat(taskArray[j][8]);
						if(!isNaN(totalResource)){
							taskDuration = daysBetweenDate(thisTaskActualStart, thisTaskActualEnd);
					
							perDayResource = totalResource/taskDuration;
							newY = newY+perDayResource;
					}
				}
			}

				
			}
		}

		// draw the new Point
		ctx.beginPath();
		ctx.fillStyle = lineColor;
		ctx.globalAlpha = 0.2;	
		ctx.lineWidth = 1;
		ctx.strokeStyle = lineColor;
		ctx.moveTo(lastX, canvasHeight - lastY*oneManDayPixel);
		ctx.lineTo(newX, canvasHeight - newY*oneManDayPixel);
		
		//ctx.stroke();
		ctx.lineTo(newX, canvasHeight);
		ctx.lineTo(lastX, canvasHeight);
		ctx.lineTo(lastX, canvasHeight - lastY*oneManDayPixel);
		ctx.fill();
		ctx.closePath();
		ctx.globalAlpha = 1.0;

		lastX = newX;
		lastY = newY;



	}


}


function drawResourcePanel(aggreOrNot, userName, userNameDisplay){
        tasklists = document.getElementsByClassName('task_lists');
        dynamicResource = document.getElementsByClassName('dynamic-resource')[0];

        // Get max and min date
        var tasknamearray = [];
        var plannedstartdatearray = [];
        var plannedcompletedatearray = [];
	var actualstartdatearray = [];
	var actualcompletedatearray = [];
	var plannedMaxResource = 0;
	var actualMaxResource = 0;
	var memberName = [];
	var alltasks = [];
	/* populate the member name */
	membersList = document.getElementsByClassName('projectmembers')[0];
	var members = membersList.getElementsByTagName('span');

	memberName = [["", "All User's"]];
	for(j=0; j< members.length; j++){
		memberName.push([members[j].innerHTML, members[j].innerHTML]);
	}
	

        if (tasklists.length <= 0)
        {       
		window.alert("no task in resource panel"); 
		return;
	}
        for (i=1; i <= tasklists.length; i++)
        {
                tasknamearray.push(document.getElementById("task_" +i + "_1").innerHTML);
                plannedstartdatearray.push(document.getElementById("task_" +i + "_3").innerHTML);
                plannedcompletedatearray.push(document.getElementById("task_" + i + "_4").innerHTML);
		actualstartdatearray.push(document.getElementById("task_" + i + "_5").innerHTML);
		actualcompletedatearray.push(document.getElementById("task_" + i + "_6").innerHTML);
		plannedResource = document.getElementById("task_" + i + "_8").innerHTML;
		actualResource = document.getElementById("task_" + i + "_9").innerHTML;
		if(!isNaN(parseFloat(plannedResource))){
			plannedMaxResource = plannedMaxResource + parseFloat(plannedResource);
		}
		if(!isNaN(parseFloat(actualResource))){
			actualMaxResource = actualMaxResource + parseFloat(actualResource);
		}
		
		task = []; 
		task.push(document.getElementById("task_" + i + "_1").innerHTML);
		task.push(document.getElementById("task_" + i + "_2").innerHTML);
		task.push(document.getElementById("task_" + i + "_3").innerHTML);
		task.push(document.getElementById("task_" + i + "_4").innerHTML);
		task.push(document.getElementById("task_" + i + "_5").innerHTML);
		task.push(document.getElementById("task_" + i + "_6").innerHTML);
		task.push(document.getElementById("task_" + i + "_7").innerHTML);
		task.push(document.getElementById("task_" + i + "_8").innerHTML);
		task.push(document.getElementById("task_" + i + "_9").innerHTML);
		alltasks.push(task);
        }

        maxPlannedDate = findMaxDateFromArray(plannedcompletedatearray);
        minPlannedDate = findMinDateFromArray(plannedstartdatearray);
	maxActualDate = findMaxDateFromArray(actualcompletedatearray);
	minActualDate = findMinDateFromArray(actualstartdatearray);
	
	minDate = minPlannedDate;
	if((minActualDate < minDate) && minActualDate instanceof Date && !isNaN(minActualDate)){
		minDate = minActualDate;
	}
	maxDate = maxPlannedDate;
	if((maxActualDate > maxDate) && maxActualDate instanceof Date && !isNaN(maxActualDate))
	{
		maxDate = maxActualDate;
	}


        startdate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        enddate = new Date(maxDate.getFullYear(), maxDate.getMonth(), daysInMonth(maxDate.getMonth(), maxDate.getFullYear()));
        numDays = daysBetweenDate(startdate, enddate);
        numMonths = monthBetweenDate(startdate, enddate);

        document.documentElement.style.setProperty("--barColNum", numDays+2);
        document.documentElement.style.setProperty("--mthColNum", numMonths+1);

        // draw the date header
        node = document.createElement('div');
        node.className = 'gantt__row gantt__row--months';
        childnode = document.createElement('div');
        childnode.className='gantt__row-first';
        node.appendChild(childnode);

        startMonth = startdate.getMonth()+1;
        startYear = startdate.getFullYear();

        for( i=0; i <= numMonths; i++)
        {
                if(startMonth>12){
                        startMonth = 1;
                        startYear++;
                }

                monthSpan = document.createElement('span');
                monthSpan.innerHTML = startYear + "/" + startMonth;
                node.appendChild(monthSpan);
                startMonth++;
        }

	dynamicResource.appendChild(node);

        // Draw the line marks
	node = document.createElement('div');
	node.className = 'gantt__row gantt__row--lines';
	today = new Date();
	todayNumDay = daysBetweenDate(startdate, today);

	for(i=0; i <= numDays ; i++)
	{
		childNode = document.createElement('span');
		if(i==todayNumDay+1)
		{
			childNode.className="marker";
		}
		node.append(childNode);
	}
	dynamicResource.appendChild(node);

	// Draw the days

	node = document.createElement('div');
	node.className = 'gantt__row gantt__row--days';
	childnode = document.createElement('span');
	node.appendChild(childnode);
	thisMonth = startdate.getMonth();
	thisYear = startdate.getFullYear();
	thisMonthDate = 1;
	thisMaxMonthDate = daysInMonth(thisMonth, thisYear);
	
	for(i=1; i <= numDays + 2 ; i++)
	{
		childnode2 = document.createElement('span');
		if(numDays < 70){
			if(thisMonthDate > thisMaxMonthDate){
					thisMonth ++;
					if(thisMonth >= 12){
						thisYear++;
						thisMonth = 0;
					}
					thisMonthDate = 1;
					thisMaxMonthDate = daysInMonth(thisMonth, thisYear);
			}
		
			childnode2.innerHTML = thisMonthDate;
			thisMonthDate ++;
		}
		node.appendChild(childnode2);
	}
	
	dynamicResource.appendChild(node);

	// draw the legend and canvas area

	node = document.createElement('div');
	node.className = 'gantt__row gantt__resource';
	legend = document.createElement('div');
	legend.className = 'gantt__row-first';
	legend.innerHTML = "Planned Aggregate Resources<br>vs<br>Actual Aggregate Resources";
	node.appendChild(legend);
	
	canvasChart = document.createElement('canvas');
	canvasChart.id='resourceChart';
	
	node.appendChild(canvasChart);

	dynamicResource.appendChild(node);

	// start drawing the resource chart

	var canvas = document.getElementById("resourceChart");
	canvas.width = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;

	plotUser = "";
	plotUserDisplay = "All User";
	if(userName){
		plotUser = userName;
	}
	if(userNameDisplay){
		plotUserDisplay = userNameDisplay;
	}
	plotPlannedAggregate(alltasks, startdate, enddate, plotUser, canvas, getColorsByNumber(0), plannedMaxResource + 10);
	plotActualAggregate(alltasks, startdate, enddate, plotUser, canvas, getColorsByNumber(1), plannedMaxResource + 10);

	var arrayOfLegend = [];
	legend = [plotUserDisplay + "'s Planned Aggregate", getColorsByNumber(0)];
	arrayOfLegend.push(legend);
	legend = [plotUserDisplay + "'s Actual Aggregate", getColorsByNumber(1)];
	arrayOfLegend.push(legend);

	plotLegend(canvas, arrayOfLegend, 0.05, 0.05, 150, 10);

}

function drawMessagePanel(){
	var warningMessages = [];
	var criticalMessages = [];
	var infoMessages = [];

	var messageHeader = ["Message Type", "Reminder Message", "Who", "Suggestion"];

	warningMessages.push(["warning","\"1st Task\" deadline has passed but no actual start and end time","Levin","enter the actual start and end date of this task"]);

	dynamicPanel = document.getElementsByClassName('dynamic-message-panel')[0];

	// draw the Panel
	messagePanel = document.createElement('div');
	messagePanel.className = "msgPanel";

	// this shall print the message header

	headerRow= document.createElement('div');
	headerRow.className = "msgHeader";

	for(i=0; i<messageHeader.length; i++)
	{
		header = document.createElement('span');
		header.id = 'msgHeader';
		header.innerHTML = messageHeader[i];
		headerRow.appendChild(header);
	}
	
	messagePanel.appendChild(headerRow);

	// draw the message


	for(i=0; i < warningMessages.length; i++)
	{
		message = warningMessages[i];
		messageRow = document.createElement('div');
		messageRow.className = "msgInfo";
		for(j=0; j< message.length; j++)
		{
			item = document.createElement('span');
			item.innerHTML = message[j];
			messageRow.appendChild(item);
		}
		messagePanel.appendChild(messageRow);
	}

	dynamicPanel.appendChild(messagePanel);

	//


}

function drawGantt(){

        tasklists = document.getElementsByClassName('task_lists');
        dynamicgantt = document.getElementsByClassName('dynamic-gantt')[0];

        // Get max and min date
        var tasknamearray = [];
        var plannedstartdatearray = [];
        var plannedcompletedatearray = [];
	var actualstartdatearray = [];
	var actualcompletedatearray = [];
        if (tasklists.length <= 0)
                return;

        for (i=1; i <= tasklists.length; i++)
        {
                tasknamearray.push(document.getElementById("task_" +i + "_1").value);
                plannedstartdatearray.push(document.getElementById("task_" +i + "_3").value);
                plannedcompletedatearray.push(document.getElementById("task_" + i + "_4").value);
		actualstartdatearray.push(document.getElementById("task_" + i + "_5").value);
		actualcompletedatearray.push(document.getElementById("task_" + i + "_6").value);
        }

        maxPlannedDate = findMaxDateFromArray(plannedcompletedatearray);
        minPlannedDate = findMinDateFromArray(plannedstartdatearray);
	maxActualDate = findMaxDateFromArray(actualcompletedatearray);
	minActualDate = findMinDateFromArray(actualstartdatearray);
	
	minDate = minPlannedDate;
	if((minActualDate < minDate) && minActualDate instanceof Date && !isNaN(minActualDate)){
		minDate = minActualDate;
	}
	maxDate = maxPlannedDate;
	if((maxActualDate > maxDate) && maxActualDate instanceof Date && !isNaN(maxActualDate))
	{
		maxDate = maxActualDate;
	}


        startdate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        enddate = new Date(maxDate.getFullYear(), maxDate.getMonth(), daysInMonth(maxDate.getMonth(), maxDate.getFullYear()));
        numDays = daysBetweenDate(startdate, enddate);
        numMonths = monthBetweenDate(startdate, enddate);

        document.documentElement.style.setProperty("--barColNum", numDays+2);
        document.documentElement.style.setProperty("--mthColNum", numMonths+1);

        // draw the date header
        node = document.createElement('div');
        node.className = 'gantt__row gantt__row--months';
        childnode = document.createElement('div');
        childnode.className='gantt__row-first';
        node.appendChild(childnode);

        startMonth = startdate.getMonth()+1;
        startYear = startdate.getFullYear();

        for( i=0; i <= numMonths; i++)
        {
                if(startMonth>12){
                        startMonth = 1;
                        startYear++;
                }

                monthSpan = document.createElement('span');
                monthSpan.innerHTML = startYear + "/" + startMonth;
                node.appendChild(monthSpan);
                startMonth++;
        }

	dynamicgantt.appendChild(node);

        // Draw the line marks
	node = document.createElement('div');
	node.className = 'gantt__row gantt__row--lines';
	today = new Date();
	todayNumDay = daysBetweenDate(startdate, today);

	for(i=0; i <= numDays + 2 ; i++)
	{
		childNode = document.createElement('span');
		if(i==todayNumDay+1)
		{
			childNode.className="marker";
		}
		node.append(childNode);
	}
	dynamicgantt.appendChild(node);

	// Draw the days

	node = document.createElement('div');
	node.className = 'gantt__row gantt__row--days';
	childnode = document.createElement('span');
	node.appendChild(childnode);
	thisMonth = startdate.getMonth();
	thisYear = startdate.getFullYear();
	thisMonthDate = 1;
	thisMaxMonthDate = daysInMonth(thisMonth, thisYear);
	
	for(i=1; i <= numDays + 2 ; i++)
	{
		childnode2 = document.createElement('span');
		if(numDays < 70){
			if(thisMonthDate > thisMaxMonthDate){
				thisMonth ++;
				if(thisMonth >= 12)
				{
					thisYear ++;
					thisMonth = 0;
				}
				thisMonthDate = 1;
				thisMaxMonthDate = daysInMonth(thisMonth, thisYear);
			}
		
			childnode2.innerHTML = thisMonthDate;
			thisMonthDate ++;
		}
		node.appendChild(childnode2);
	}
	dynamicgantt.appendChild(node);

	//  Draw the planned timeline and acual timeline

        for (i=1; i <= tasklists.length; i++)
        {
        // get TaskName, Start Date, End Date
        var taskname = document.getElementById("task_" + i + "_1").value;
        var taskPlannedStart = document.getElementById("task_" + i + "_3").value;
        var taskPlannedEnd = document.getElementById("task_" + i + "_4").value;
	var taskActualStart = document.getElementById("task_" + i + "_5").value;
	var taskActualEnd = document.getElementById("task_" + i + "_6").value;

        colStart = daysBetweenDate(startdate, taskPlannedStart);
        colEnd = daysBetweenDate(startdate, taskPlannedEnd);
	actStart = daysBetweenDate(startdate, taskActualStart);
	actEnd = daysBetweenDate(startdate, taskActualEnd);
	if(isNaN(actStart))
	{
		actEnd = 0;
		actStart = 0;
	}else if (isNaN(actEnd)){
		actEnd = daysBetweenDate(startdate, new Date());
	}

        node = document.createElement('div');
        node.className = 'gantt__row';
        childnode = document.createElement('div');
        childnode.className='gantt__row-first';
        childnode.innerHTML= taskname;
        childnode2 = document.createElement('ul');
        childnode2.className='gantt__row-bars';
        bar = document.createElement('li');
        bar.style = "grid-column: " + (colStart+1) + "/" + (colEnd+1);
        //bar.innerHTML = taskPlannedStart;
        //bar.background-color = 'ff6252';
        //childnode2.appendChild(bar);

	// append actual bar
	// if there is delay
	if(!(actStart==0 && actEnd==0)){
		if(actStart < colStart)
		{
			earlybar = document.createElement('li');
			earlybar.className = 'early';
			earlybar.style = "grid-column: " + (actStart+1) + "/" + (colStart+1);
			childnode2.appendChild(earlybar);
		}
			childnode2.appendChild(bar);
		if(actEnd > colEnd)
		{	
			expirebar = document.createElement('li');
			expirebar.className = 'delay';
			expirebar.style = "grid-column: " + (colEnd+1) + "/" + (actEnd+1);
			childnode2.appendChild(expirebar);
		}
		
	}else{
		childnode2.appendChild(bar);
	}

	actbar = document.createElement('li');
	actbar.className = 'stripes';
	actbar.style = "grid-column: " + (actStart+1) + "/" + (actEnd+1);

	
	if(!(actStart==0&&actEnd==0)){
		childnode2.append(actbar);
	}
        
	node.appendChild(childnode);
        node.appendChild(childnode2);
        dynamicgantt.appendChild(node);
        // add row in dynamic gannt
        }

	
}

function drawGanttFromElement(){

        tasklists = document.getElementsByClassName('task_lists');
        dynamicgantt = document.getElementsByClassName('dynamic-gantt')[0];

        // Get max and min date
        var tasknamearray = [];
        var plannedstartdatearray = [];
        var plannedcompletedatearray = [];
	var actualstartdatearray = [];
	var actualcompletedatearray = [];
        if (tasklists.length <= 0)
                return;

        for (i=1; i <= tasklists.length; i++)
        {
                tasknamearray.push(document.getElementById("task_" +i + "_1").innerHTML);
                plannedstartdatearray.push(document.getElementById("task_" +i + "_3").innerHTML);
                plannedcompletedatearray.push(document.getElementById("task_" + i + "_4").innerHTML);
		actualstartdatearray.push(document.getElementById("task_" + i + "_5").innerHTML);
		actualcompletedatearray.push(document.getElementById("task_" + i + "_6").innerHTML);
        }

        maxPlannedDate = findMaxDateFromArray(plannedcompletedatearray);
        minPlannedDate = findMinDateFromArray(plannedstartdatearray);
	maxActualDate = findMaxDateFromArray(actualcompletedatearray);
	minActualDate = findMinDateFromArray(actualstartdatearray);
	
	minDate = minPlannedDate;
	if((minActualDate < minDate) && minActualDate instanceof Date && !isNaN(minActualDate)){
		minDate = minActualDate;
	}
	maxDate = maxPlannedDate;
	if((maxActualDate > maxDate) && maxActualDate instanceof Date && !isNaN(maxActualDate))
	{
		maxDate = maxActualDate;
	}


        startdate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        enddate = new Date(maxDate.getFullYear(), maxDate.getMonth(), daysInMonth(maxDate.getMonth(), maxDate.getFullYear()));
        numDays = daysBetweenDate(startdate, enddate);
        numMonths = monthBetweenDate(startdate, enddate);

        document.documentElement.style.setProperty("--barColNum", numDays+2);
        document.documentElement.style.setProperty("--mthColNum", numMonths+1);

        // draw the date header
        node = document.createElement('div');
        node.className = 'gantt__row gantt__row--months';
        childnode = document.createElement('div');
        childnode.className='gantt__row-first';
        node.appendChild(childnode);

        startMonth = startdate.getMonth()+1;
        startYear = startdate.getFullYear();

        for( i=0; i <= numMonths; i++)
        {
                if(startMonth>12){
                        startMonth = 1;
                        startYear++;
                }

                monthSpan = document.createElement('span');
                monthSpan.innerHTML = startYear + "/" + startMonth;
                node.appendChild(monthSpan);
                startMonth++;
        }

	dynamicgantt.appendChild(node);

        // Draw the line marks
	node = document.createElement('div');
	node.className = 'gantt__row gantt__row--lines';
	today = new Date();
	todayNumDay = daysBetweenDate(startdate, today);

	for(i=0; i <= numDays + 2 ; i++)
	{
		childNode = document.createElement('span');
		if(i==todayNumDay+1)
		{
			childNode.className="marker";
		}
		node.append(childNode);
	}
	dynamicgantt.appendChild(node);

	// Draw the days

	node = document.createElement('div');
	node.className = 'gantt__row gantt__row--days';
	childnode = document.createElement('span');
	node.appendChild(childnode);
	thisMonth = startdate.getMonth();
	thisYear = startdate.getFullYear();
	thisMonthDate = 1;
	thisMaxMonthDate = daysInMonth(thisMonth, thisYear);
	
	for(i=1; i <= numDays + 2 ; i++)
	{
		childnode2 = document.createElement('span');
		if(numDays < 70){
			if(thisMonthDate > thisMaxMonthDate){
				thisMonth ++;
				if(thisMonth >= 12)
				{
					thisYear ++;
					thisMonth = 0;
				}
				thisMonthDate = 1;
				thisMaxMonthDate = daysInMonth(thisMonth, thisYear);
			}
		
			childnode2.innerHTML = thisMonthDate;
			thisMonthDate ++;
		}
		node.appendChild(childnode2);
	}
	dynamicgantt.appendChild(node);

	//  Draw the planned timeline and acual timeline

        for (i=1; i <= tasklists.length; i++)
        {
        // get TaskName, Start Date, End Date
        var taskname = document.getElementById("task_" + i + "_1").innerHTML;
        var taskPlannedStart = document.getElementById("task_" + i + "_3").innerHTML;
        var taskPlannedEnd = document.getElementById("task_" + i + "_4").innerHTML;
	var taskActualStart = document.getElementById("task_" + i + "_5").innerHTML;
	var taskActualEnd = document.getElementById("task_" + i + "_6").innerHTML;

        colStart = daysBetweenDate(startdate, taskPlannedStart);
        colEnd = daysBetweenDate(startdate, taskPlannedEnd);
	actStart = daysBetweenDate(startdate, taskActualStart);
	actEnd = daysBetweenDate(startdate, taskActualEnd);
	if(isNaN(actStart))
	{
		actEnd = 0;
		actStart = 0;
	}else if (isNaN(actEnd)){
		actEnd = daysBetweenDate(startdate, new Date());
	}

        node = document.createElement('div');
        node.className = 'gantt__row';
        childnode = document.createElement('div');
        childnode.className='gantt__row-first';
        childnode.innerHTML= taskname;
        childnode2 = document.createElement('ul');
        childnode2.className='gantt__row-bars';
        bar = document.createElement('li');
        bar.style = "grid-column: " + (colStart+1) + "/" + (colEnd+1);
        //bar.innerHTML = taskPlannedStart;
        //bar.background-color = 'ff6252';
        //childnode2.appendChild(bar);

	// append actual bar
	// if there is delay
	if(!(actStart==0 && actEnd==0)){
		if(actStart < colStart)
		{
			earlybar = document.createElement('li');
			earlybar.className = 'early';
			earlybar.style = "grid-column: " + (actStart+1) + "/" + (colStart+1);
			childnode2.appendChild(earlybar);
		}
			childnode2.appendChild(bar);
		if(actEnd > colEnd)
		{	
			expirebar = document.createElement('li');
			expirebar.className = 'delay';
			expirebar.style = "grid-column: " + (colEnd+1) + "/" + actEnd			
			childnode2.appendChild(expirebar);
		}
		
	}else{
		childnode2.appendChild(bar);
	}

	actbar = document.createElement('li');
	actbar.className = 'stripes';
	actbar.style = "grid-column: " + (actStart+1) + "/" + (actEnd);

	
	if(!(actStart==0&&actEnd==0)){
		childnode2.append(actbar);
	}
       
	//window.alert("Actual End = " + actEnd);
 
	node.appendChild(childnode);
        node.appendChild(childnode2);
        dynamicgantt.appendChild(node);
        // add row in dynamic gannt
        }

	
}

