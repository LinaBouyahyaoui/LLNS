// Salary service to parse CSV data and calculate daily costs
export class SalaryService {
  constructor() {
    this.salaryData = new Map();
    this.loadSalaryData();
  }

  async loadSalaryData() {
    try {
      const response = await fetch('/simple_salary_dataset.csv');
      const csvText = await response.text();
      this.parseCSV(csvText);
    } catch (error) {
      console.error('Error loading salary data:', error);
      // Fallback: load from local file if fetch fails
      this.loadLocalSalaryData();
    }
  }

  loadLocalSalaryData() {
    // Fallback data - in a real app, this would be loaded from a database
    const fallbackData = [
      { name: 'Hannah Taylor', monthlySalary: 3431 },
      { name: 'Charlie Martinez', monthlySalary: 3391 },
      { name: 'Laura Lee', monthlySalary: 10264 },
      { name: 'Bob Harris', monthlySalary: 2535 },
      { name: 'Rachel Davis', monthlySalary: 11121 },
      { name: 'Julia Walker', monthlySalary: 7005 },
      { name: 'Wendy Miller', monthlySalary: 9644 },
      { name: 'Paula Lee', monthlySalary: 13899 },
      { name: 'George Lee', monthlySalary: 5138 },
      { name: 'Bob Martin', monthlySalary: 10784 }
    ];

    fallbackData.forEach(person => {
      this.salaryData.set(person.name, person.monthlySalary);
    });
  }

  parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',');
        if (values.length >= 2) {
          const name = values[0].trim();
          const monthlySalary = parseFloat(values[1].trim());
          if (!isNaN(monthlySalary)) {
            this.salaryData.set(name, monthlySalary);
          }
        }
      }
    }
  }

  getDailyCost(employeeName) {
    const monthlySalary = this.salaryData.get(employeeName);
    if (!monthlySalary) {
      console.warn(`No salary data found for ${employeeName}`);
      return 0;
    }
    
    // Assuming 20 working days per month
    return monthlySalary / 20;
  }

  getAllEmployees() {
    return Array.from(this.salaryData.keys());
  }

  getSalaryData() {
    return this.salaryData;
  }
}

export const salaryService = new SalaryService();
