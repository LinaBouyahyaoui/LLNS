// Naive Bayes Classifier for Ticket Classification
// Implements semi-supervised learning using the JIRA export data

class NaiveBayesClassifier {
  constructor() {
    this.classes = ['need_more_info', 'discard', 'forward_other_team'];
    this.vocabulary = new Set();
    this.classWordCounts = {};
    this.classDocCounts = {};
    this.totalDocs = 0;
    this.isTrained = false;
  }

  // Text preprocessing
  preprocessText(text) {
    if (!text) return [];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2) // Remove short words
      .filter(word => !this.isStopWord(word)); // Remove stop words
  }

  // Basic stop words list
  isStopWord(word) {
    const stopWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'is', 'are', 'was',
      'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'can', 'this', 'that', 'these', 'those', 'a', 'an', 'as', 'if',
      'then', 'than', 'so', 'no', 'not', 'only', 'own', 'same', 'such',
      'too', 'very', 'just', 'now', 'here', 'there', 'when', 'where',
      'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most',
      'other', 'some', 'what', 'which', 'who', 'whom', 'whose'
    ]);
    return stopWords.has(word);
  }

  // Extract features from ticket data
  extractFeatures(ticket) {
    const features = [];
    
    // Combine text fields for analysis
    const textContent = [
      ticket.summary || '',
      ticket.description || '',
      ticket.component || '',
      ticket.environment || '',
      ticket.issueType || '',
      ticket.priority || ''
    ].join(' ');

    // Add preprocessed text features
    features.push(...this.preprocessText(textContent));

    // Add categorical features
    if (ticket.priority) features.push(`priority_${ticket.priority.toLowerCase()}`);
    if (ticket.issueType) features.push(`type_${ticket.issueType.toLowerCase()}`);
    if (ticket.environment) features.push(`env_${ticket.environment.toLowerCase()}`);
    if (ticket.component) features.push(`comp_${ticket.component.toLowerCase()}`);

    return features;
  }

  // Train the classifier
  async train() {
    try {
      console.log('Loading training data...');
      const response = await fetch('/jira_export_minimal_HPS_tickets.csv');
      const csvText = await response.text();
      
      const lines = csvText.split('\n');
      const headers = lines[0].split(',');
      
      // Initialize class counters
      this.classWordCounts = {};
      this.classDocCounts = {};
      this.totalDocs = 0;
      
      this.classes.forEach(cls => {
        this.classWordCounts[cls] = {};
        this.classDocCounts[cls] = 0;
      });

      // Process each ticket
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = this.parseCSVLine(line);
        if (values.length < headers.length) continue;

        const ticket = {};
        headers.forEach((header, index) => {
          ticket[header.trim()] = values[index] ? values[index].trim() : '';
        });

        const label = ticket['HPS Triage Class'];
        if (!label || !this.classes.includes(label)) continue;

        const features = this.extractFeatures(ticket);
        
        // Update vocabulary
        features.forEach(feature => this.vocabulary.add(feature));
        
        // Update class word counts
        features.forEach(feature => {
          if (!this.classWordCounts[label][feature]) {
            this.classWordCounts[label][feature] = 0;
          }
          this.classWordCounts[label][feature]++;
        });
        
        // Update class document counts
        this.classDocCounts[label]++;
        this.totalDocs++;
      }

      console.log(`Training completed: ${this.totalDocs} documents, ${this.vocabulary.size} features`);
      this.isTrained = true;
      
      return {
        success: true,
        totalDocs: this.totalDocs,
        vocabularySize: this.vocabulary.size,
        classDistribution: this.classDocCounts
      };
      
    } catch (error) {
      console.error('Training failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Parse CSV line handling quoted values
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  // Calculate probability of a class given features
  calculateClassProbability(features, className) {
    const classDocCount = this.classDocCounts[className] || 0;
    const classPrior = classDocCount / this.totalDocs;
    
    let logLikelihood = Math.log(classPrior);
    
    features.forEach(feature => {
      const featureCount = this.classWordCounts[className][feature] || 0;
      const totalFeatureCount = Object.values(this.classWordCounts)
        .reduce((sum, classCounts) => sum + (classCounts[feature] || 0), 0);
      
      // Laplace smoothing
      const smoothedProbability = (featureCount + 1) / (classDocCount + this.vocabulary.size);
      logLikelihood += Math.log(smoothedProbability);
    });
    
    return logLikelihood;
  }

  // Predict the class for a given ticket
  predict(ticket) {
    if (!this.isTrained) {
      throw new Error('Model not trained. Call train() first.');
    }

    const features = this.extractFeatures(ticket);
    const probabilities = {};
    
    // Calculate probability for each class
    this.classes.forEach(className => {
      probabilities[className] = this.calculateClassProbability(features, className);
    });
    
    // Find the class with highest probability
    let bestClass = this.classes[0];
    let bestProbability = probabilities[bestClass];
    
    this.classes.forEach(className => {
      if (probabilities[className] > bestProbability) {
        bestClass = className;
        bestProbability = probabilities[className];
      }
    });
    
    // Convert log probabilities to regular probabilities for confidence
    const expProbabilities = {};
    this.classes.forEach(className => {
      expProbabilities[className] = Math.exp(probabilities[className]);
    });
    
    const totalExpProbability = Object.values(expProbabilities).reduce((sum, prob) => sum + prob, 0);
    const confidence = expProbabilities[bestClass] / totalExpProbability;
    
    return {
      predictedClass: bestClass,
      confidence: confidence,
      probabilities: expProbabilities,
      logProbabilities: probabilities
    };
  }

  // Get model statistics
  getModelStats() {
    if (!this.isTrained) {
      return { error: 'Model not trained' };
    }
    
    return {
      isTrained: this.isTrained,
      totalDocs: this.totalDocs,
      vocabularySize: this.vocabulary.size,
      classes: this.classes,
      classDistribution: this.classDocCounts,
      classProbabilities: Object.fromEntries(
        this.classes.map(cls => [cls, this.classDocCounts[cls] / this.totalDocs])
      )
    };
  }

  // Reset the model
  reset() {
    this.vocabulary.clear();
    this.classWordCounts = {};
    this.classDocCounts = {};
    this.totalDocs = 0;
    this.isTrained = false;
  }
}

// Create and export singleton instance
export const naiveBayesClassifier = new NaiveBayesClassifier();
