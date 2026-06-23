const MockDB = {
  initialize: function() {
    this.initUsers();
    this.initIssues();
    this.initEvents();
    this.initProviders();
  },

  initUsers: function() {
    if (Storage.getUsers().length === 0) {
      Storage.register('Admin User', 'admin@localpulse.com', 'admin@1234', 'admin');
      Storage.register('Standard User', 'user@localpulse.com', 'user123', 'user');
      Storage.register('Test User', 'testuser@gmail.com', 'testuser', 'user');
    }
  },

  initIssues: function() {
    // If not seeded or if we have the old "Mock Issue" data, re-seed.
    const currentIssues = Storage.getIssues();
    if (currentIssues.length === 0 || currentIssues.some(i => i.title.includes('Mock Issue'))) {
      Storage._set(StorageKeys.ISSUES, []);
      const statuses = ['Pending', 'In Progress', 'Resolved'];
      const issues = [];
      
      const baseLat = 11.0168;
      const baseLng = 76.9558;

      const realIssues = [
        { title: "Deep Potholes on RS Puram DB Road", category: "Road Issue", location: "RS Puram, Coimbatore", desc: "Multiple large potholes have formed near the main intersection causing severe traffic slowdowns and hazards for two-wheelers." },
        { title: "Water Logging near Peelamedu Signal", category: "Water Issue", location: "Peelamedu, Coimbatore", desc: "Storm water drain seems blocked. Heavy water stagnation after yesterday's rain is causing massive traffic jams." },
        { title: "Streetlight Malfunction in Vadavalli", category: "Electricity", location: "Vadavalli, Coimbatore", desc: "The entire stretch of Marudamalai road near the bus depot has been dark for three consecutive nights." },
        { title: "Garbage Overflowing in Saibaba Colony", category: "Garbage", location: "Saibaba Colony, Coimbatore", desc: "The main community bin hasn't been cleared for four days. Foul smell is affecting nearby residents." },
        { title: "Open Manhole Danger", category: "Safety", location: "Town Hall, Coimbatore", desc: "An open manhole near the Oppanakara Street market needs immediate covering. Very dangerous for pedestrians." },
        { title: "Pipe Burst near Gandhipuram Bus Stand", category: "Water Issue", location: "Gandhipuram, Coimbatore", desc: "Drinking water pipe has burst resulting in thousands of liters of water wastage on the main road." },
        { title: "Fallen Tree Blocking Road", category: "Road Issue", location: "Race Course, Coimbatore", desc: "A large gulmohar tree branch fell during the wind last night, completely blocking the walking path." },
        { title: "Transformer Sparking", category: "Electricity", location: "Kovaipudur, Coimbatore", desc: "Continuous sparking observed from the street transformer. Might cause a short circuit soon." },
        { title: "Stray Dog Menace", category: "Safety", location: "Singanallur, Coimbatore", desc: "A pack of aggressive stray dogs near the bus terminal is causing panic among early morning commuters." },
        { title: "Illegal Dumping of Medical Waste", category: "Garbage", location: "Tirupur Road, Coimbatore", desc: "Suspicious bags of what appears to be clinical waste dumped near the highway outskirt." },
        { title: "Broken Footpath", category: "Road Issue", location: "Cross Cut Road, Coimbatore", desc: "Pedestrian tiles are completely broken making it impossible to walk safely during shopping hours." },
        { title: "Contaminated Tap Water", category: "Water Issue", location: "Ramanathapuram, Coimbatore", desc: "Corporation water supply has a strange yellowish tint and bad odor today." },
        { title: "Low Voltage Issue", category: "Electricity", location: "Thudiyalur, Coimbatore", desc: "Persistent low voltage causing household appliances to malfunction for the past week." },
        { title: "Uncollected E-Waste", category: "Garbage", location: "Saravanampatti, Coimbatore", desc: "Old monitors and batteries dumped near the IT park vacant plot." },
        { title: "No School Zone Signboards", category: "Safety", location: "Perur, Coimbatore", desc: "Vehicles are overspeeding near the high school. Need urgent installation of speed breakers and signs." }
      ];

      realIssues.forEach((data, index) => {
        issues.push({
          id: `issue_${index + 1}`,
          title: data.title,
          description: data.desc,
          category: data.category,
          location: data.location,
          latitude: baseLat + (Math.random() * 0.05 - 0.025),
          longitude: baseLng + (Math.random() * 0.05 - 0.025),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          image: "assets/images/placeholder-issue.jpg",
          authorId: 2, // Standard User
          createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
          upvotes: Math.floor(Math.random() * 50) + 5
        });
      });

      issues.forEach(issue => {
        const current = Storage.getIssues();
        current.push(issue);
        Storage._set(StorageKeys.ISSUES, current);
      });
    }
  },

  initEvents: function() {
    const currentEvents = Storage.getEvents();
    if (currentEvents.length === 0 || currentEvents.some(e => e.title.includes('Community Event'))) {
      const events = [
        {
          id: `event_1`,
          title: `Ukkadam Lake Mass Cleanup`,
          description: `Join hands with local NGOs to clear plastic waste from the Ukkadam lake bunds. Gloves and bags will be provided.`,
          date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          time: '06:30 AM',
          location: `Ukkadam Lake, Coimbatore`
        },
        {
          id: `event_2`,
          title: `Race Course Tree Plantation`,
          description: `Let's make our city greener! We are planting 100 native saplings around the Race Course walking track.`,
          date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
          time: '07:00 AM',
          location: `Race Course, Coimbatore`
        },
        {
          id: `event_3`,
          title: `Road Safety Awareness Drive`,
          description: `A collaborative event with Coimbatore Traffic Police to distribute pamphlets and helmets to two-wheeler riders.`,
          date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          time: '09:00 AM',
          location: `Avinashi Road Signal, Coimbatore`
        },
        {
          id: `event_4`,
          title: `Free Medical & Eye Camp`,
          description: `Free basic health checkup and eye testing organized by Kovai Medical Trust for senior citizens.`,
          date: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
          time: '10:00 AM',
          location: `R.S. Puram Corporation Hall`
        },
        {
          id: `event_5`,
          title: `E-Waste Collection Drive`,
          description: `Safely dispose of your old electronics, batteries, and cables. Authorized recyclers will be present to collect them.`,
          date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
          time: '10:00 AM',
          location: `Codissia Grounds, Coimbatore`
        }
      ];
      Storage._set(StorageKeys.EVENTS, events);
    }
  },

  initProviders: function() {
    // Force reset to ensure the requested authentic Indian demo state with advanced schema
    const currentProviders = Storage.getProviders();
    // If missing coverageArea, force reset
    if (currentProviders.length < 40 || !currentProviders[0]?.coverageArea) {
      Storage._set(StorageKeys.PROVIDERS, []);
      const providers = [];
      let idCounter = 1;

      const locations = ['RS Puram', 'Peelamedu', 'Singanallur', 'Gandhipuram', 'Saibaba Colony', 'Race Course', 'Ukkadam', 'Town Hall', 'Sundarapuram', 'Saravanampatti'];
      
      function getRandomLocations(primary) {
        const shuffled = locations.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 1); // 1 to 3 areas
        if (!selected.includes(primary)) selected.push(primary);
        return selected;
      }

      function getStatus() {
        const rand = Math.random();
        if (rand > 0.85) return 'Inactive';
        if (rand > 0.75) return 'On Leave';
        return 'Active';
      }

      // 10 Authentic Electricians
      const electricianNames = ['Sri Ram Electricals', 'Murugan Power Fix', 'Kannan Electrical Works', 'Balaji Electricals', 'Saravana Spark Fix', 'Ganesh Power Solutions', 'Velan Electricals', 'Ayyappa Wiring Experts', 'Karthick Electricals', 'Arumugam Switch Services'];
      electricianNames.forEach(name => {
        const primaryLoc = locations[Math.floor(Math.random() * locations.length)];
        providers.push({
          id: `PROV${idCounter.toString().padStart(3, '0')}`,
          name: name,
          category: 'Electrician',
          role: 'Field Technician',
          email: `${name.split(' ')[0].toLowerCase()}@localpulse.demo`,
          phone: `+91 98765432${(idCounter%100).toString().padStart(2, '0')}`,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          description: `Professional and reliable electrical wiring and repair services by ${name}.`,
          location: primaryLoc,
          coverageArea: getRandomLocations(primaryLoc),
          status: getStatus(),
          assignedIssues: Math.floor(Math.random() * 20),
          createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
        });
        idCounter++;
      });

      // 10 Authentic Plumbers
      const plumberNames = ['Natarajan Plumbers', 'Selvam Pipe Works', 'Kumaran Plumbing Services', 'Vetri Water Solutions', 'Mani Leak Fix', 'Prakash Plumbing', 'Rajesh Pipe Masters', 'Muthu Drain Experts', 'Anand Aqua Repairs', 'Siva Plumbing Services'];
      plumberNames.forEach(name => {
        const primaryLoc = locations[Math.floor(Math.random() * locations.length)];
        providers.push({
          id: `PROV${idCounter.toString().padStart(3, '0')}`,
          name: name,
          category: 'Plumber',
          role: 'Water Department',
          email: `${name.split(' ')[0].toLowerCase()}@localpulse.demo`,
          phone: `+91 98765432${(idCounter%100).toString().padStart(2, '0')}`,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          description: `Expert leak fixing, motor repair, and pipe installation by ${name}.`,
          location: primaryLoc,
          coverageArea: getRandomLocations(primaryLoc),
          status: getStatus(),
          assignedIssues: Math.floor(Math.random() * 20),
          createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
        });
        idCounter++;
      });

      // 10 Authentic Cleaners
      const cleanerNames = ['Amman Cleaning Services', 'Clean Coimbatore Co.', 'Kovai Spotless Services', 'Vasantham Waste Management', 'Arunachalam Cleaning', 'Bharathi Cleaners', 'Nehru Street Cleaners', 'Kalaivani DustBusters', 'Sri Krishna Cleaning', 'Nanjappa Neat Services'];
      cleanerNames.forEach(name => {
        const primaryLoc = locations[Math.floor(Math.random() * locations.length)];
        providers.push({
          id: `PROV${idCounter.toString().padStart(3, '0')}`,
          name: name,
          category: 'Cleaning',
          role: 'Garbage Collection',
          email: `${name.split(' ')[0].toLowerCase()}@localpulse.demo`,
          phone: `+91 98765432${(idCounter%100).toString().padStart(2, '0')}`,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          description: `Top-tier residential cleaning and waste management by ${name}.`,
          location: primaryLoc,
          coverageArea: getRandomLocations(primaryLoc),
          status: getStatus(),
          assignedIssues: Math.floor(Math.random() * 20),
          createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
        });
        idCounter++;
      });

      // 10 Authentic Mechanics
      const mechanicNames = ['Thangam Auto Garage', 'Raju Motor Works', 'Palani Mechanic Shop', 'Kovai Auto Fix', 'Senthil Wheel Care', 'Gowtham Two Wheeler Workshop', 'Moorthy Auto Repairs', 'Suresh Car Clinic', 'Ashok Motors', 'Pandi Bike Garage'];
      mechanicNames.forEach(name => {
        const primaryLoc = locations[Math.floor(Math.random() * locations.length)];
        providers.push({
          id: `PROV${idCounter.toString().padStart(3, '0')}`,
          name: name,
          category: 'Mechanic',
          role: 'Emergency Response Team',
          email: `${name.split(' ')[0].toLowerCase()}@localpulse.demo`,
          phone: `+91 98765432${(idCounter%100).toString().padStart(2, '0')}`,
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          description: `Trusted vehicle repairs, servicing, and emergency towing by ${name}.`,
          location: primaryLoc,
          coverageArea: getRandomLocations(primaryLoc),
          status: getStatus(),
          assignedIssues: Math.floor(Math.random() * 20),
          createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0]
        });
        idCounter++;
      });

      Storage._set(StorageKeys.PROVIDERS, providers);
    }
  }
};

window.MockDB = MockDB;
