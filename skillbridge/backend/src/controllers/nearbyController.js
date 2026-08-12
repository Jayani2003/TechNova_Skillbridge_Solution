const db = require('../config/db');

exports.getNearbyOpportunities = async (req, res) => {
  try {
    // 1. Fetch Open Gigs
    const [gigs] = await db.query(
      `SELECT id, title, category, budget, location, latitude, longitude, 'GIG' as type 
       FROM gigs WHERE status = 'OPEN' OR status = 'APPLIED'`
    );

    // 2. Fetch Boarding listings
    const [boarding] = await db.query(
      `SELECT id, title, price, distance_from_faculty, location, latitude, longitude, 'BOARDING' as type 
       FROM boarding`
    );

    // 3. Fetch Available Resources
    const [resources] = await db.query(
      `SELECT id, title, category, type as resource_type, location, latitude, longitude, 'RESOURCE' as type 
       FROM resources WHERE status = 'AVAILABLE'`
    );

    // 4. Fetch Users/Talents
    const [talents] = await db.query(
      `SELECT id, full_name, user_type, location, latitude, longitude, 'TALENT' as type 
       FROM users`
    );

    // Combine all and apply slight random offsets (approx. 10-30 meters) to coordinates for privacy
    const items = [];

    const obfuscate = (val) => {
      // Shift by a tiny fraction (-0.0005 to +0.0005)
      return parseFloat(val) + (Math.random() - 0.5) * 0.001;
    };

    gigs.forEach(g => {
      items.push({
        id: `gig-${g.id}`,
        dbId: g.id,
        title: g.title,
        subtitle: `${g.category} • Rs. ${parseFloat(g.budget).toLocaleString()}`,
        location: g.location,
        latitude: obfuscate(g.latitude),
        longitude: obfuscate(g.longitude),
        itemType: 'GIG',
        color: '#3b82f6' // Blue
      });
    });

    boarding.forEach(b => {
      items.push({
        id: `boarding-${b.id}`,
        dbId: b.id,
        title: b.title,
        subtitle: `Rs. ${parseFloat(b.price).toLocaleString()}/month • ${b.distance_from_faculty} km from campus`,
        location: b.location,
        latitude: obfuscate(b.latitude),
        longitude: obfuscate(b.longitude),
        itemType: 'BOARDING',
        color: '#eab308' // Yellow
      });
    });

    resources.forEach(r => {
      items.push({
        id: `resource-${r.id}`,
        dbId: r.id,
        title: r.title,
        subtitle: `${r.resource_type === 'DONATION' ? 'Free Donation' : 'Requested Item'} • ${r.category}`,
        location: r.location,
        latitude: obfuscate(r.latitude),
        longitude: obfuscate(r.longitude),
        itemType: 'RESOURCE',
        color: r.resource_type === 'DONATION' ? '#22c55e' : '#ec4899' // Green / Pink
      });
    });

    talents.forEach(t => {
      items.push({
        id: `talent-${t.id}`,
        dbId: t.id,
        title: t.full_name,
        subtitle: t.user_type === 'STUDENT' ? 'Student Worker' : 'Community Provider',
        location: t.location,
        latitude: obfuscate(t.latitude),
        longitude: obfuscate(t.longitude),
        itemType: 'TALENT',
        color: t.user_type === 'STUDENT' ? '#a855f7' : '#f97316' // Purple / Orange
      });
    });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving nearby opportunities.' });
  }
};
