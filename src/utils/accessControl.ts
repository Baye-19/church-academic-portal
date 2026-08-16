import { User, AcademicClass, Course } from '../types';

/**
 * Checks if a user has full, unrestricted access to all classes.
 * Admins, Department Heads, and Coordinators always have full access.
 * Teachers have full access ONLY if explicitly granted `canAccessAllClasses === true`.
 */
export function hasFullClassAccess(user?: User | null): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN' || user.role === 'DEPT_HEAD' || user.role === 'COORDINATOR') {
    return true;
  }
  if (user.role === 'TEACHER') {
    return Boolean(user.canAccessAllClasses);
  }
  return false;
}

/**
 * Gets the set of class IDs accessible by the user.
 */
export function getAccessibleClassIds(
  user?: User | null,
  courses?: Course[],
  allClasses?: AcademicClass[]
): Set<string> {
  if (!user) return new Set();
  if (hasFullClassAccess(user)) {
    if (allClasses && allClasses.length > 0) {
      return new Set(allClasses.map((c) => c.id));
    }
    return new Set(['cls-1', 'cls-2', 'cls-3', 'cls-4', 'cls-5', 'cls-6', 'cls-7', 'cls-8']);
  }

  const ids = new Set<string>(user.assignedClassIds || []);

  // Include classes only for explicitly assigned courses
  const assignedCourseIds = new Set(user.assignedCourseIds || []);
  if (courses && assignedCourseIds.size > 0) {
    courses.forEach((c) => {
      if (assignedCourseIds.has(c.id) && c.classId) {
        ids.add(c.classId);
      }
    });
  }

  return ids;
}

/**
 * Checks if a specific class is accessible by the user.
 */
export function canAccessClass(
  user: User | null | undefined,
  classId: string,
  courses?: Course[],
  allClasses?: AcademicClass[]
): boolean {
  if (!user) return false;
  if (hasFullClassAccess(user)) return true;
  const accessible = getAccessibleClassIds(user, courses, allClasses);
  return accessible.has(classId);
}

/**
 * Filter classes to only those accessible by the user.
 */
export function filterAccessibleClasses(
  classes: AcademicClass[],
  user?: User | null,
  courses?: Course[]
): AcademicClass[] {
  if (!user || hasFullClassAccess(user)) return classes;
  const accessibleIds = getAccessibleClassIds(user, courses, classes);
  return classes.filter((cls) => accessibleIds.has(cls.id));
}

/**
 * Filter courses to only those accessible by the user.
 */
export function filterAccessibleCourses(courses: Course[], user?: User | null): Course[] {
  if (!user || hasFullClassAccess(user)) return courses;

  const assignedCourseIds = new Set(user.assignedCourseIds || []);
  const assignedClassIds = new Set(user.assignedClassIds || []);

  if (assignedCourseIds.size > 0 || assignedClassIds.size > 0) {
    return courses.filter((c) => {
      // 1. Direct course assignment
      if (assignedCourseIds.has(c.id)) return true;
      // 2. Class-level assignment
      if (assignedClassIds.has(c.classId)) return true;
      return false;
    });
  }

  // Fallback for user with no explicit assignment arrays configured
  return courses.filter((c) => c.teacherId === user.id);
}
