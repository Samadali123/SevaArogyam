import type { Clinic, DoctorUser } from '../types';

/**
 * Returns a standardized lowercase branch slug for a given branch identifier or object.
 * Examples:
 *  - "Rajgarh Branch" -> "rajgarh"
 *  - "Sarangpur" -> "sarangpur"
 *  - "Shujalpur" -> "shujalpur"
 *  - UUID "4b696ca6-0cab-4dfb-b82f-999ca450ba47" -> "rajgarh" (via lookup)
 */
export const getBranchSlug = (item: string | any, clinicsList: Clinic[] = []): string => {
  if (!item) return '';
  const str = typeof item === 'string' ? item : (item.id || item.city || item.name || '');
  const clean = str.toLowerCase().replace(/\s*branch\s*/i, '').trim();

  if (clean === 'sarangpur' || clean.includes('sarangpur')) return 'sarangpur';
  if (clean === 'shujalpur' || clean.includes('shujalpur')) return 'shujalpur';
  if (clean === 'rajgarh' || clean.includes('rajgarh')) return 'rajgarh';

  // Fallback: search in clinicsList
  if (clinicsList && clinicsList.length > 0) {
    const found = clinicsList.find(c =>
      c.id === str ||
      c.id === clean ||
      c.name.toLowerCase() === clean ||
      (c.city && c.city.toLowerCase() === clean)
    );
    if (found) {
      const foundCity = (found.city || found.name).toLowerCase().replace(/\s*branch\s*/i, '').trim();
      if (foundCity.includes('sarangpur')) return 'sarangpur';
      if (foundCity.includes('shujalpur')) return 'shujalpur';
      if (foundCity.includes('rajgarh')) return 'rajgarh';
      return foundCity;
    }
  }

  return clean;
};

/**
 * Normalizes an array or raw clinicsCovered data into clean branch slugs (e.g. ["sarangpur", "shujalpur", "rajgarh"])
 */
export const normalizeClinicsCovered = (rawCovered: any, clinicsList: Clinic[] = []): string[] => {
  if (!rawCovered) return [];
  let list: string[] = [];
  if (Array.isArray(rawCovered)) {
    list = rawCovered;
  } else if (typeof rawCovered === 'string' && rawCovered.trim()) {
    try {
      const parsed = JSON.parse(rawCovered);
      if (Array.isArray(parsed)) list = parsed;
      else list = rawCovered.split(',').map((s: string) => s.trim()).filter(Boolean);
    } catch {
      list = rawCovered.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  const slugs = list.map(item => getBranchSlug(item, clinicsList)).filter(Boolean);
  return Array.from(new Set(slugs));
};

/**
 * Checks if a doctor is assigned to a specific branch/clinic
 */
export const isDoctorInBranch = (doctor: DoctorUser | any, branchOrClinic: string | Clinic | any, clinicsList: Clinic[] = []): boolean => {
  if (!doctor) return false;
  const targetSlug = getBranchSlug(branchOrClinic, clinicsList);
  if (!targetSlug) return false;

  const docCovered = normalizeClinicsCovered(doctor.clinicsCovered, clinicsList);
  if (docCovered.length > 0) {
    return docCovered.includes(targetSlug);
  }

  // Fallback if doctor has single branch/branchId property
  const docBranch = getBranchSlug(doctor.branch || doctor.branchId, clinicsList);
  return docBranch === targetSlug;
};

/**
 * Dynamically counts how many active doctors are assigned to a clinic
 */
export const getBranchDoctorCount = (branchOrClinic: string | Clinic | any, doctorsList: (DoctorUser | any)[] = [], clinicsList: Clinic[] = []): number => {
  const targetSlug = getBranchSlug(branchOrClinic, clinicsList);
  if (!targetSlug) return 0;

  return (doctorsList || []).filter(d => {
    if (d.isActive === false) return false;
    return isDoctorInBranch(d, targetSlug, clinicsList);
  }).length;
};

/**
 * Formats assigned branches array into human-readable label e.g., "Sarangpur Branch, Shujalpur Branch"
 */
export const formatAssignedBranches = (clinicsCovered?: any, clinicsList: Clinic[] = []): string => {
  const slugs = normalizeClinicsCovered(clinicsCovered, clinicsList);
  if (slugs.length === 0) return 'No Assigned Branch';

  const branchNameMap: Record<string, string> = {
    sarangpur: 'Sarangpur Branch',
    shujalpur: 'Shujalpur Branch',
    rajgarh: 'Rajgarh Branch',
  };

  const names = slugs.map(slug => {
    if (branchNameMap[slug]) return branchNameMap[slug];
    const found = clinicsList.find(c => getBranchSlug(c, clinicsList) === slug);
    if (found) return found.name.includes('Branch') ? found.name : `${found.name} Branch`;
    return slug.charAt(0).toUpperCase() + slug.slice(1) + ' Branch';
  });

  return Array.from(new Set(names)).join(', ');
};
