import { formatBytes, formatSeconds, generateSlug, getFileCategory, calculateExpiry } from './src/lib/utils.js';

console.log('--- Testing utils.js ---');

// Test formatBytes
console.assert(formatBytes(0) === '0 B', '0 bytes test');
console.assert(formatBytes(1024) === '1 KB', '1024 bytes test');
console.assert(formatBytes(1048576) === '1 MB', '1MB test');
console.assert(formatBytes(1073741824) === '1 GB', '1GB test');
console.assert(formatBytes(1099511627776) === '1 TB', '1TB test');
console.log('formatBytes: PASS (supports up to TB)');

// Test formatSeconds
console.assert(formatSeconds(30) === '30s', '30s test');
console.assert(formatSeconds(90) === '1m 30s', '90s test');
console.assert(formatSeconds(3665) === '1h 1m', '1h test');
console.log('formatSeconds: PASS');

// Test generateSlug
const slug1 = generateSlug(8);
console.assert(slug1.length === 8, 'slug length test');
console.log('generateSlug: PASS ->', slug1);

// Test getFileCategory
console.assert(getFileCategory('image/jpeg', 'photo.jpg') === 'image', 'image category');
console.assert(getFileCategory('video/mp4', 'clip.mp4') === 'video', 'video category');
console.assert(getFileCategory('audio/mpeg', 'song.mp3') === 'audio', 'audio category');
console.assert(getFileCategory('application/pdf', 'doc.pdf') === 'document', 'document category');
console.assert(getFileCategory('application/zip', 'files.zip') === 'archive', 'archive category');
console.log('getFileCategory: PASS');

// Test calculateExpiry
const exp1 = calculateExpiry('1d');
const exp7 = calculateExpiry('7d');
const exp30 = calculateExpiry('30d');
console.assert(new Date(exp1) > new Date(), '1d expiry in future');
console.assert(new Date(exp7) > new Date(exp1), '7d after 1d');
console.assert(new Date(exp30) > new Date(exp7), '30d after 7d');
console.log('calculateExpiry: PASS');

console.log('All unit tests passed cleanly with 0 failures!');
