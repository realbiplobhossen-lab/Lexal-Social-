import React from "react";

import { auth }
from "../config/firebase";

export default function ProfileScreen(){

const user=
auth.currentUser;

return(

<div className="page">

<h2>Profile</h2>

<p>

Email:
{user?.email}

</p>

<p>

UID:
{user?.uid}

</p>

</div>

);

}