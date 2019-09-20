

// This script file is for the common time/date manupulation for plotting gantt chart
// Date: 2019-03-13
// Last Modified by: Louis Lau
// Email: lauhakming@gmail.com


/*function msg(){
	window.alert("MyTime Script")
}*/

function daysInMonth(thisMonth, thisYear)
{
	// This function shall return the number of days in a particular month and year.
	return (32 - new Date(thisYear, thisMonth, 32).getDate());
}

function monthBetweenDate(fromDateObj, toDateObj)
{

	if(!fromDateObj.getMonth){
		fromDateObj = new Date(fromDateObj);
	}
	if(!toDateObj.getMonth){
		toDateObj = new Date(toDateObj);
	}
	
	yearDifference = toDateObj.getFullYear() - fromDateObj.getFullYear();
	
	monthDifference = toDateObj.getMonth() - fromDateObj.getMonth();
	
	return monthDifference + 12 * yearDifference;
}

function daysBetweenDate(fromDateObj, toDateObj)
{
	// This function shall return the number of days between two dates.
	// fromDateObj is a String or a Date Object.
	// toDateObj is a String or a Date Object. 
	// If it is not a day object, it will try to convert it to a Date Object from string. 
	// The String Input should be in YYYY-MM-DD format.
	
	if(!fromDateObj.getMonth){
		fromDateObj = new Date(fromDateObj);
		
	}
	if(!toDateObj.getMonth){
		toDateObj = new Date(toDateObj);
		
	}	
	
	fromDateInUTC = Date.UTC(fromDateObj.getFullYear(), fromDateObj.getMonth() + 1, fromDateObj.getDate());
	toDateInUTC = Date.UTC(toDateObj.getFullYear(), toDateObj.getMonth() + 1, toDateObj.getDate());

	return Math.floor((toDateObj - fromDateObj)/(60*60*24*1000));
}

function findMaxDateFromArray(thisArrayDate){
	// This function shall return the max Date in Date Object format in an Array of Date Objects or Date Strings
		
		if(!thisArrayDate.length){
			return;
		}
		
		var maxDate = thisArrayDate[0];
		
		if(!maxDate.getMonth){
			maxDate = new Date(maxDate);
		}
		
		for(i=0; i < thisArrayDate.length; i++)
		{
			thisDate = thisArrayDate[i];
			if(!thisDate.getMonth){
				thisDate = new Date(thisDate);
			}
			
			if(thisDate > maxDate){
				maxDate = thisDate;
			}
			if (!(maxDate instanceof Date && !isNaN(maxDate))){
				maxDate = thisDate;
			}
			
		}
		
		return maxDate;
		
}

function findMinDateFromArray(thisArrayDate){
	// This function shall return the max Date in Date Object format in an Array of Date Objects or Date Strings

		if(!thisArrayDate.length){
			return;
		}
		
		var minDate = thisArrayDate[0];
		
		if(!minDate.getMonth){
			minDate = new Date(minDate);
		}
		
		for(i=0; i < thisArrayDate.length; i++)
		{
			thisDate = thisArrayDate[i];
			if(!thisDate.getMonth){
				thisDate = new Date(thisDate);
			}
			if(thisDate < minDate){
				minDate = thisDate;
			}
			if(!(minDate instanceof Date && !isNaN(minDate))){
				minDate = thisDate;
			}
		}
		
		return minDate;
		
}

function addDate(dateObj, increment, interval)
{
	// This function should return a date object added by a date
	
	if(!dateObj.getMonth){
			dateObj = new Date(dateObj);
	}
	
	if(interval=="MONTH"){
		thismonth = dateObj.getMonth();
		thisyear = dateObj.getMonth();
		incrementMonth = increment;
		
		incrementYear = Math.floor((thismonth + increment)/12);
		if(increment >= 0){
			for(i=0; i < incrementYear; i++)
			{
				incrementMonth = incrementMonth - 12;
			}
		}else{	// if increment = -11 month, thismonth = 3, incrementYear = -1, incrementMonth should be = 4
			for(i=0; i < -1 * incrementYear; i++)
			{
				incrementMonth = incrementMonth + 12; // incrementMonth = -11 + 12 = 1
			}
		}
		
		return (new Date(Date.UTC(dateObj.getFullYear() + incrementYear, thismonth + incrementMonth, dateObj.getDate())));
																
	}
	
	if(interval=="YEAR"){
		return (new Date(Date.UTC(dateObj.getFullYear() + increment, dateObj.getMonth(), dateObj.getDate())));
	}
	
	if(interval=="WEEK"){
		return (new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 7*increment)));
	}
	
}

function module_selfTest()
{
	var testInput = [];
	var testOutput = [];
	var testResult = [];

	// +a == +b is added because it can not compare two object, will try to force two object to number for
	// comparison
	
	
	testResult.push([ a = addDate("2019-01-31",-1,"MONTH"), b = new Date(Date.UTC(2018,11,31)), +a==+b ]);
	testResult.push([ a = addDate("2019-01-31",-13,"MONTH"), b = new Date(Date.UTC(2017, 11, 31)), +a==+b ]);
	testResult.push([ a = addDate("2019-01-31",1,"MONTH"), b = new Date(Date.UTC(2019,2,3)), +a==+b ]);
	testResult.push([ a = addDate("2019-01-31",13, "MONTH"), b = new Date(Date.UTC(2020, 2, 2)), +a==+b ]);
	testResult.push([ a = addDate("2018-01-31",13, "MONTH"), b = new Date(Date.UTC(2019, 2, 3)), +a==+b ]);
	testResult.push([ a = addDate("2018-01-31",-1, "YEAR"), b = new Date(Date.UTC(2017, 0, 31)), +a==+b ]);
	testResult.push([ a = addDate("2019-01-31",1, "YEAR"), b = new Date(Date.UTC(2020, 0, 31)), +a==+b ]);
	testResult.push([ a = addDate("2020-02-29",-1, "YEAR"), b = new Date(Date.UTC(2019, 1, 29)), +a==+b ]);
	testResult.push([ a = addDate("2019-02-28", 1, "YEAR"), b = new Date(Date.UTC(2020, 1, 28)), +a==+b ]);
	testResult.push([ a = addDate("2019-02-28", 1, "WEEK"), b = new Date(Date.UTC(2019, 2, 7)), +a==+b ]);
	testResult.push([ a = addDate("2020-02-28", 1, "WEEK"), b = new Date(Date.UTC(2020, 2, 6)), +a==+b ]);
	testResult.push([ a = addDate("2020-03-11", -2, "WEEK"), b = new Date(Date.UTC(2020, 1, 26)), +a==+b ]);
	testResult.push([ a = monthBetweenDate("2020-02-11", "2020-03-11"), b = 1 , +a==+b ]);
	testResult.push([ a = monthBetweenDate("2020-03-11", "2020-02-11"), b = -1 , +a==+b ]);
	testResult.push([ a = monthBetweenDate("2020-02-11", "2020-03-1"), b = 1 , +a==+b ]);
	testResult.push([ a = monthBetweenDate("2019-12-31", "2020-1-1"), b = 1 , +a==+b ]);
	testResult.push([ a = monthBetweenDate("2020-1-1", "2019-12-31"), b = -1 , +a==+b ]);
	testResult.push([ a = monthBetweenDate("2000-1-1", "2020-1-31"), b = 240 , +a==+b ]);
	testResult.push([ a = daysBetweenDate("2019-3-31", "2019-4-1"), b=1, +a==+b ]);
	testResult.push([ a = daysBetweenDate("2019-3-30", "2019-3-31"), b=1, +a==+b ]);
	testResult.push([ a = daysBetweenDate("2019-2-28", "2019-3-1"), b=1, +a==+b ]);
	testResult.push([ a = daysBetweenDate("2019-2-28", "2019-4-1"), b=32, +a==+b ]);
	testResult.push([ a = Math.floor((new Date("2019-3-1"))-(new Date("2019-2-28")))/(60*60*24*1000), b=1, +a==+b]);

	testResult.push([ a = 1, b = 1, a==b]);
	

	//testResult.push(addDate("2019-1-31", -1, "MONTH") == new Date(Date.UTC(2018, 12, 31)));
	//testResult.push(addDate("2019-1-31", 13, "MONTH") == new Date(Date.UTC(2020, 3, 3)));
	//testResult.push(addDate("2019-1-31", -13, "MONTH") == new Date(Date.UTC(2017, 12, 31)));
	
	//window.alert(addDate("2019-1-31",1,"MONTH"));
	//window.alert(new Date(Date.UTC(2019,3,3)));
	
	document.write("<table border=1>");
	for(i=0; i < testResult.length; i++){
		document.write("<tr><td>Test " + i + " Result : </td><td>" + testResult[i][0] + "</td><td>" + testResult[i][1] + "</td><td>" + testResult[i][2] + "</td></tr>");
	}
	document.write("</table>");
}
