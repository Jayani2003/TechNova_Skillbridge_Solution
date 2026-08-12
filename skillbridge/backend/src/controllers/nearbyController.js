const db = require('../config/db');

exports.getNearbyOpportunities = async (req, res) => {
  try {
    // 1. Fetch Open Gigs (enriched with description, duration, deadline, payment_type)
    const [gigs] = await db.query(
      `SELECT id, title, category, budget, location, latitude, longitude, description, duration, deadline, payment_type, 'GIG' as type 
       FROM gigs WHERE status = 'OPEN' OR status = 'APPLIED'`
    );

    // 2. Fetch Boarding listings (enriched with rooms_count, facilities, description, contact_method)
    const [boarding] = await db.query(
      `SELECT id, title, price, distance_from_faculty, location, latitude, longitude, rooms_count, facilities, description, contact_method, 'BOARDING' as type 
       FROM boarding`
    );

    // 3. Fetch Available Resources (enriched with description, item_condition)
    const [resources] = await db.query(
      `SELECT id, title, category, type as resource_type, location, latitude, longitude, description, item_condition, 'RESOURCE' as type 
       FROM resources WHERE status = 'AVAILABLE'`
    );

    // 4. Fetch Users/Talents (enriched with student/community profile info and user skills)
    const [talents] = await db.query(
      `SELECT u.id, u.full_name, u.user_type, u.location, u.latitude, u.longitude,
              sp.university, sp.faculty, sp.academic_year, sp.degree_program, sp.availability, sp.expected_rate, sp.bio as student_bio,
              cp.occupation, cp.business_name, cp.services, cp.bio as community_bio,
              (SELECT GROUP_CONCAT(skill_name) FROM user_skills WHERE user_id = u.id) as skills,
              'TALENT' as type
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN community_profiles cp ON u.id = cp.user_id`
    );

    // Combine all and apply slight random offsets (approx. 10-30 meters) to coordinates for privacy
    const items = [];

    const obfuscate = (val) => {
      // Shift by a tiny fraction (-0.0005 to +0.0005)
      return parseFloat(val) + (Math.random() - 0.5) * 0.001;
    };

    const hasCoordinates = (latitude, longitude) => {
      return Number.isFinite(parseFloat(latitude)) && Number.isFinite(parseFloat(longitude));
    };

    gigs.forEach(g => {
      if (!hasCoordinates(g.latitude, g.longitude)) return;

      items.push({
        id: `gig-${g.id}`,
        dbId: g.id,
        title: g.title,
        subtitle: `${g.category} • Rs. ${parseFloat(g.budget).toLocaleString()}`,
        location: g.location,
        latitude: obfuscate(g.latitude),
        longitude: obfuscate(g.longitude),
        itemType: 'GIG',
        itemLabel: 'Gig / Job',
        route: `/gigs?selected=${g.id}`,
        color: '#3b82f6', // Blue
        description: g.description,
        paymentType: g.payment_type,
        duration: g.duration,
        deadline: g.deadline,
        category: g.category,
        budget: g.budget
      });
    });

    boarding.forEach(b => {
      if (!hasCoordinates(b.latitude, b.longitude)) return;

      items.push({
        id: `boarding-${b.id}`,
        dbId: b.id,
        title: b.title,
        subtitle: `Rs. ${parseFloat(b.price).toLocaleString()}/month • ${b.distance_from_faculty} km from campus`,
        location: b.location,
        latitude: obfuscate(b.latitude),
        longitude: obfuscate(b.longitude),
        itemType: 'BOARDING',
        itemLabel: 'Boarding Place',
        route: `/boarding?selected=${b.id}`,
        color: '#eab308', // Yellow
        description: b.description,
        price: b.price,
        distance: b.distance_from_faculty,
        roomsCount: b.rooms_count,
        facilities: b.facilities ? b.facilities.split(',').map(f => f.trim()) : [],
        contactMethod: b.contact_method
      });
    });

    resources.forEach(r => {
      if (!hasCoordinates(r.latitude, r.longitude)) return;

      const isDonation = r.resource_type === 'DONATION';
      items.push({
        id: `resource-${r.id}`,
        dbId: r.id,
        title: r.title,
        subtitle: `${isDonation ? 'Free Donation' : 'Requested Item'} • ${r.category}`,
        location: r.location,
        latitude: obfuscate(r.latitude),
        longitude: obfuscate(r.longitude),
        itemType: isDonation ? 'DONATION' : 'REQUEST',
        itemLabel: isDonation ? 'Donation Offer' : 'Donation Request',
        route: `/resources?selected=${r.id}`,
        color: isDonation ? '#22c55e' : '#ec4899', // Green / Pink
        description: r.description,
        category: r.category,
        condition: r.item_condition,
        resourceType: r.resource_type
      });
    });

    talents.forEach(t => {
      if (!hasCoordinates(t.latitude, t.longitude)) return;

      const isStudent = t.user_type === 'STUDENT';
      items.push({
        id: `talent-${t.id}`,
        dbId: t.id,
        title: t.full_name,
        subtitle: isStudent ? 'Student Worker' : 'Community Worker',
        location: t.location,
        latitude: obfuscate(t.latitude),
        longitude: obfuscate(t.longitude),
        itemType: isStudent ? 'STUDENT_WORKER' : 'COMMUNITY_WORKER',
        itemLabel: isStudent ? 'Student Worker' : 'Community Worker',
        route: `/talent?selected=${t.id}&userType=${t.user_type}`,
        color: isStudent ? '#a855f7' : '#f97316', // Purple / Orange
        bio: isStudent ? t.student_bio : t.community_bio,
        skills: t.skills ? t.skills.split(',').map(s => s.trim()) : [],
        university: t.university,
        faculty: t.faculty,
        academicYear: t.academic_year,
        degreeProgram: t.degree_program,
        availability: t.availability,
        expectedRate: t.expected_rate,
        occupation: t.occupation,
        businessName: t.business_name,
        services: t.services
      });
    });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving nearby opportunities.' });
  }
};
