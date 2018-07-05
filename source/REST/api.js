// Instruments
import { MAIN_URL, TOKEN } from './config.js';

export const api = {
    async fetchTasks () {
        const response = await fetch(MAIN_URL, {
            method:  'GET',
            headers: {
                Authorization: TOKEN,
            },
        });

        const { data: tasks } = await response.json();

        if (response.status !== 200) {
            throw new Error('Tasks were not fetched.');
        }

        return tasks;
    },
    async createTask (newTask) {
        const response = await fetch(MAIN_URL, {
            method:  'POST',
            headers: {
                Authorization:  TOKEN,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: newTask }),
        });

        const { data: task } = await response.json();

        if (response.status !== 200) {
            throw new Error('Task was not created.');
        }

        return task;
    },
    async updateTask (newTask) {
        const response = await fetch(MAIN_URL, {
            method:  'PUT',
            headers: {
                Authorization:  TOKEN,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([newTask]),
        });

        const { data: [updatedTask] } = await response.json();

        if (response.status !== 200) {
            throw new Error('Task was not updated.');
        }

        return updatedTask;
    },
    async completeAllTasks (tasks) {
        const promises = [];

        for (const task of tasks) {
            promises.push(
                fetch(MAIN_URL, {
                    method:  'PUT',
                    headers: {
                        Authorization:  TOKEN,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify([{
                        ...task,
                        completed: true,
                    }]),
                }),
            );
        }

        const responses = await Promise.all(promises);
        const isSuccess = responses.every((result) => result.status === 200);

        if (!isSuccess) {
            throw new Error('Tasks were not completed');
        }
    },
    async removeTask (id) {
        const response = await fetch(`${MAIN_URL}/${id}`, {
            method:  'DELETE',
            headers: {
                Authorization: TOKEN,
            },
        });

        if (response.status !== 204) {
            throw new Error('Task was not deleted.');
        }
    },
};
