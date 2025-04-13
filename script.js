document.getElementById('view-student-records').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/students')
        .then(response => response.json())
        .then(data => {
            const dataContainer = document.getElementById('data-container');
            dataContainer.innerHTML = '<h3>Student Records</h3>';
            
            // Create table
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            // Create table headers
            const headers = ['ID', 'Name', 'Age', 'department'];
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                tr.appendChild(th);
            });
            thead.appendChild(tr);
            table.appendChild(thead);

            // Create table rows
            data.forEach(item => {
                const tr = document.createElement('tr');
                const tdId = document.createElement('td');
                tdId.textContent = item.id;
                const tdName = document.createElement('td');
                tdName.textContent = item.name;
                const tdAge = document.createElement('td');
                tdAge.textContent = item.age;
                const tdDepartment = document.createElement('td');
                tdDepartment.textContent = item.department;
                tr.appendChild(tdId);
                tr.appendChild(tdName);
                tr.appendChild(tdAge);
                tr.appendChild(tdDepartment);
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            dataContainer.appendChild(table);
        })
        .catch(error => console.error('Error fetching student records:', error));
});

document.getElementById('manage-faculty').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/faculty')
        .then(response => response.json())
        .then(data => {
            const dataContainer = document.getElementById('data-container');
            dataContainer.innerHTML = '<h3>Faculty Records</h3>';
            
            // Create table
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            // Create table headers
            const headers = ['ID', 'Name', 'Department', 'Position'];
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                tr.appendChild(th);
            });
            thead.appendChild(tr);
            table.appendChild(thead);

            // Create table rows
            data.forEach(item => {
                const tr = document.createElement('tr');
                const tdId = document.createElement('td');
                tdId.textContent = item.id;
                const tdName = document.createElement('td');
                tdName.textContent = item.name;
                const tdDepartment = document.createElement('td');
                tdDepartment.textContent = item.department;
                const tdPosition = document.createElement('td');
                tdPosition.textContent = item.position;
                tr.appendChild(tdId);
                tr.appendChild(tdName);
                tr.appendChild(tdDepartment);
                tr.appendChild(tdPosition);
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            dataContainer.appendChild(table);
        })
        .catch(error => console.error('Error fetching faculty records:', error));
});