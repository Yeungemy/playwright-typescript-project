import { faker } from '@faker-js/faker';

export const autoUser = {
    firstName: "Auto" + faker.person.firstName,
    lastName: faker.person.lastName(),
    adultBirthday: faker.date.birthdate({ min: 27, max: 65, mode: 'age' }).toISOString().split('T')[0], // YYYY-MM-DD
    dependentBirthday: faker.date.birthdate({ min: 0, max: 21, mode: 'age' }).toISOString().split('T')[0], // YYYY-MM-DD
    email: faker.internet.email(),
    phoneNumber: faker.phone.number(),
    address: faker.location.streetAddress(),
}