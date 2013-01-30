/*
 * $Id$
 * --------------------------------------------------------------------------------------
 * Copyright (c) MuleSoft, Inc.  All rights reserved.  http://www.mulesoft.com
 *
 * The software in this package is published under the terms of the CPAL v1.0
 * license, a copy of which has been included with this distribution in the
 * LICENSE.txt file.
 */

package org.mule.webservice.ws;

import org.mule.api.MuleEvent;
import org.mule.api.MuleException;
import org.mule.webservice.AbstractWebServiceInterface;
import org.mule.webservice.api.WebServiceOperationRouter;

public class WSWebServiceInterface extends AbstractWebServiceInterface
{

    public WSWebServiceInterface(String name)
    {
        super(name);
    }

    @Override
    public WebServiceOperationRouter getOperationRouter()
    {
        return new SOAPActionOperationRouter();
    }

}
