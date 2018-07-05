// Core
import React, { Component } from 'react';
import Move from 'react-flip-move';

// Instruments
import Styles from './styles.m.css';
import Checkbox from '../../theme/assets/Checkbox';
import { api } from '../../REST';
import { sortTasksByGroup } from '../../instruments';

// Components
import Task from '../Task';
import Spinner from '../Spinner';

export default class Scheduler extends Component {
    state = {
        isTasksFetching: false,
        newTaskMessage:  '',
        tasksFilter:     '',
        tasks:           [],
    };

    componentDidMount () {
        this._fetchTasksAsync();
    }

    _fetchTasksAsync = async () => {
        try {
            this._setTasksFetchingState(true);
            const tasks = await api.fetchTasks();

            this.setState({ tasks: sortTasksByGroup(tasks) });
        } finally {
            this._setTasksFetchingState(false);
        }
    };

    _createTaskAsync = async (event) => {
        try {
            this._setTasksFetchingState(true);
            event.preventDefault();
            const { newTaskMessage } = this.state;

            if (!newTaskMessage) {
                return null;
            }

            const newTask = await api.createTask(newTaskMessage);

            this.setState(({ tasks }) => ({
                tasks:          sortTasksByGroup([newTask, ...tasks]),
                newTaskMessage: '',
            }));
        } finally {
            this._setTasksFetchingState(false);
        }
    };

    _updateTasksFilter = (event) => {
        const tasksFilter = event.target.value.toLowerCase();

        if (tasksFilter.length > 50) {

            return null;
        }
        this.setState({ tasksFilter });
    };

    _updateNewTaskMessage = (event) => {
        const newTaskMessage = event.target.value;

        this.setState({ newTaskMessage });
    };

    _updateTaskAsync = async (updatedTask) => {
        try {
            const { tasks } = this.state;

            this._setTasksFetchingState(true);

            const task = await api.updateTask(updatedTask);

            this.setState({ tasks: sortTasksByGroup(this._updateTasks(tasks, task)) });

        } finally {
            this._setTasksFetchingState(false);
        }
    };

    _removeTaskAsync = async (taskId) => {
        try {
            this._setTasksFetchingState(true);
            await api.removeTask(taskId);
            this.setState(({ tasks }) => ({
                tasks: sortTasksByGroup(tasks.filter((item) => item.id !== taskId)),
            }));
        } finally {
            this._setTasksFetchingState(false);
        }
    };

    _getAllCompleted = () => this.state.tasks.every((task) => task.completed);

    _completeAllTasksAsync = async () => {
        try {
            const notCompletedTasks = this.state.tasks.filter((item) => item.completed !== true);

            if (notCompletedTasks.length === 0) {
                return null;
            }
            this._setTasksFetchingState(true);
            await api.completeAllTasks(notCompletedTasks);
            this.setState(({ tasks }) => ({
                tasks: sortTasksByGroup(this._setAllTasksComplete(tasks)),
            }));
        } finally {
            this._setTasksFetchingState(false);
        }
    };

    _setAllTasksComplete = (tasks) => {
        return tasks.map((item) => {
            return { ...item, completed: true };
        });
    }

    _setTasksFetchingState = (state) => {
        this.setState({ isTasksFetching: state });
    };

    _updateTasks = (tasks, newTask) => {
        return tasks.map((item) => {
            if (item.id === newTask.id) {
                return newTask;
            }

            return item;
        });
    }

    render () {
        const {
            isTasksFetching,
            tasks,
            tasksFilter,
            newTaskMessage,
        } = this.state;

        const allCompleted = this._getAllCompleted();
        const todoList = tasks
            .filter((task) => task.message
                .toLowerCase()
                .includes(tasksFilter))
            .map((props) => (
                <Task
                    _removeTaskAsync = { this._removeTaskAsync }
                    _updateTaskAsync = { this._updateTaskAsync }
                    key = { props.id }
                    { ...props }
                />
            ));

        return (
            <section className = { Styles.scheduler }>
                <main>
                    <Spinner isSpinning = { isTasksFetching } />
                    <header>
                        <h1 className = { Styles.test }>Планировщик задач</h1>
                        <input
                            placeholder = 'Поиск'
                            type = 'search'
                            value = { tasksFilter }
                            onChange = { this._updateTasksFilter }
                        />
                    </header>
                    <section>
                        <form onSubmit = { this._createTaskAsync }>
                            <input
                                className = { Styles.createTask }
                                maxLength = { 50 }
                                placeholder = 'Описaние моей новой задачи'
                                type = 'text'
                                value = { newTaskMessage }
                                onChange = { this._updateNewTaskMessage }
                            />
                            <button>Добавить задачу</button>
                        </form>
                        <div className = { Styles.overlay }>
                            <ul>
                                <Move duration = { 400 } easing = 'ease-in-out'>
                                    {todoList}
                                </Move>
                            </ul>
                        </div>
                    </section>
                    <footer>
                        <Checkbox
                            checked = { allCompleted }
                            color1 = '#363636'
                            color2 = '#fff'
                            onClick = { this._completeAllTasksAsync }
                        />
                        <span className = { Styles.completeAllTasks }>
                            Все задачи выполнены
                        </span>
                    </footer>
                </main>
            </section>
        );
    }
}
