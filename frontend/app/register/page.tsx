"use client"
import React from "react";
import {useState} from "react"
import {useRouter} from "next/navigation"
export default function Register() 
{   
    const BACKEND_PORT = process.env.BACKEND_PORT ?? '3001';
    const BACKEND_URL = process.env.BACKEND_URL ? `${process.env.BACKEND_URL}${BACKEND_PORT}` : `http://localhost:${BACKEND_PORT}`; 
    const [errors, setErrors] = useState<string[]>([]);
    const [formData,setFormData] = useState({username:"", email:"", password:"", confirmedPassword:"",});
    const router = useRouter(); 
    const handleFormDatachange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(formData.password!=formData.confirmedPassword)
        {
            setErrors([...errors, "Error: Passwords don't match"]);
            return;
        }
        setErrors([]);
        alert(`Form data submited. The data is: ${JSON.stringify(formData)}`);
        try {
            const url = `${BACKEND_URL}/auth/register-jwt`;
            alert(url);
            const res = await fetch(url, {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ 
                    username: formData.username, 
                    email: formData.email, 
                    password: formData.password.toString(), 
                })
            });
            const data = await res.json();
            alert(JSON.stringify(data));
            if(res.ok)
            {
                setErrors(['Registration Successful! Please log in.'])
                router.push('/login');
            }
        } catch (error) {
            console.error("Error registering on server", error);
            setErrors([...errors, "Server Error Registering User"]);
        }
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
