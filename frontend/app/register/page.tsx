"use client"
import React from "react";
import {useState} from "react"

export default function Register() 
{   
    const [errors, setErrors] = useState<string[]>([]);
    const [formData,setFormData] = useState({username:"", email:"", password:"", confirmedPassword:"",});
    const handleFormDatachange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(formData.password!=formData.confirmedPassword)
        {
            setErrors([...errors, "Error: Passwords don't match"]);
            return;
        }
        setErrors([]);
        alert(`Form data submited. The data is: ${JSON.stringify(formData)}`);
    };


    return (
    <>
        <h1>Register</h1>
        
        <form method="POST" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" required value={formData.username} onChange={handleFormDatachange}></input>
            </div>
            <div>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required value={formData.email} onChange={handleFormDatachange}></input>
            </div>
            <div>
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" required value={formData.password} onChange={handleFormDatachange}></input>
            </div>
            <div>
                <label htmlFor="confirmedPassword">Confirm</label>
                <input type="password" id="confirmedPassword" name="confirmedPassword" required value={formData.confirmedPassword} onChange={handleFormDatachange}></input>
            </div>
            <button type="submit">Register</button>
        </form>
    </>
    );
}
